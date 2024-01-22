import { BrowserRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

import UserContext, { type UserState } from './contexts/UserContext'
import AccountPage from './pages/AccountPage'
import FindRecipesPage from './pages/FindRecipesPage'
import HomePage from './pages/HomePage'
import Login from './components/Login'
import MyFridgePage from './pages/MyFridgePage'
import NavMenu from './components/NavMenu'
import NotFoundMessage from './components/NotFoundMessage'
import RecipePage from './pages/RecipePage'

interface RouteItem {
  path: string
  element: React.JSX.Element
}

function App (): React.JSX.Element {
  function toRouteElements (routes: RouteItem[]): React.JSX.Element[] {
    return routes.map(route => <Route key={route.path} path={route.path} element={route.element} />)
  }

  const routes = [
    { path: '/', element: <HomePage />, name: 'Home' },
    { path: '/fridge', element: <MyFridgePage />, name: 'My Fridge' },
    { path: '/findrecipes', element: <FindRecipesPage />, name: 'Find Recipes' },
    { path: '/account', element: <AccountPage />, name: 'Account' }
  ]
  const nonNavRoutes = [
    { path: '/recipe/:id', element: <RecipePage /> },
    { path: '*', element: <NotFoundMessage /> }
  ]

  // TODO: Login to set state
  const [userState, setUserState] = React.useState<UserState | null>({
    userId: 1,
    fridgeId: 1
  })

  return (
    <BrowserRouter>
      <UserContext.Provider value={userState}>
        <Login className='float-right' setUserState={setUserState} />
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
