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
import RecipePage from './pages/RecipePage'

const LOCAL_STORAGE_KEY = 'login'

interface RouteItem {
  path: string
  element: React.JSX.Element
}

function App (): React.JSX.Element {
  function toRouteElements (routes: RouteItem[]): React.JSX.Element[] {
    return routes.map(route => <Route key={route.path} path={route.path} element={route.element} />)
  }

  const rawUserState = localStorage.getItem(LOCAL_STORAGE_KEY)
  const [userState, setUserState] = React.useState<UserState | null>(
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

  const routes = [
    { path: '/', element: <HomePage />, name: 'Home' },
    { path: '/fridge', element: <MyFridgePage setUserState={handleUserStateChange} />, name: 'My Fridge' },
    { path: '/findrecipes', element: <FindRecipesPage />, name: 'Find Recipes' },
    { path: '/account', element: <AccountPage />, name: 'Account' }
  ]
  const nonNavRoutes = [
    { path: '/recipe/:id', element: <RecipePage /> },
    { path: '*', element: <NotFoundMessage /> }
  ]



  return (
    <BrowserRouter>
      <UserContext.Provider value={userState}>
        <Login className='float-right' handleLogin={handleUserStateChange} />
        <NavMenu items={routes} />
        <Routes>
          {toRouteElements(routes)}
          {toRouteElements(nonNavRoutes)}
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App
