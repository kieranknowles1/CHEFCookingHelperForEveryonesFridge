import { BrowserRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

import UserContext, { type UserState } from './contexts/UserContext'
import AccountPage from './pages/AccountPage'
import FindRecipesPage from './pages/FindRecipesPage'
import HomePage from './pages/HomePage'
import Login from './components/Login'
import MyFridgePage from './pages/MyFridgePage'
import NavMenu from './components/NavMenu'
import NotFoundMessage from './errorpages/NotFoundMessage'
import PageTitle from './components/PageTitle'
import RecipePage from './pages/RecipePage'
import SignUpPage from './pages/SignUpPage'

const LOCAL_STORAGE_KEY = 'login'

interface RouteItem {
  path: string
  element: React.JSX.Element
  name: string
  /** @default true */
  nav?: boolean
}

function App (): React.JSX.Element {
  function toRouteElements (routes: RouteItem[]): React.JSX.Element[] {
    return routes.map(route => <Route
      key={route.path}
      path={route.path}
      element={<>
        <PageTitle title={route.name}/>
        {route.element}
      </>}
    />)
  }

  const rawUserState = localStorage.getItem(LOCAL_STORAGE_KEY)
  const [userState, setUserState] = React.useState<UserState | null>(
    // The JSON here comes from localStorage, so it's safe to parse.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    rawUserState === null ? null : JSON.parse(rawUserState)
  )

  function handleUserStateChange (userState: UserState | null): void {
    setUserState(userState)
    if (userState === null) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userState))
    }
  }

  const routes: RouteItem[] = [
    { path: '/', element: <HomePage />, name: 'Home' },
    { path: '/fridge', element: <MyFridgePage setUserState={handleUserStateChange} />, name: 'My Fridge' },
    { path: '/findrecipes', element: <FindRecipesPage setUserState={handleUserStateChange} />, name: 'Find Recipes' },
    { path: '/account', element: <AccountPage setUserState={handleUserStateChange} />, name: 'Account' },
    { path: '/recipe/:id', element: <RecipePage setUserState={handleUserStateChange} />, name: 'Recipe', nav: false },
    { path: '/signup', element: <SignUpPage setUserState={handleUserStateChange} />, name: 'Sign Up', nav: userState === null },
    { path: '*', element: <NotFoundMessage />, name: 'Page Not Found', nav: false }
  ]

  return (
    <BrowserRouter>
      <UserContext.Provider value={userState}>
        <NavMenu items={routes.filter(r => r.nav !== false)} />
        <div className='bg-raisin_black-550'>
          <Login className='float-right' handleLogin={handleUserStateChange} />
          <br />
        </div>
        <Routes>
          {toRouteElements(routes)}
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App
