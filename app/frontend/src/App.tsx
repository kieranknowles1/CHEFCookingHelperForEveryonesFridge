import { BrowserRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

import FindRecipesPage from './pages/FindRecipesPage'
import HomePage from './pages/HomePage'
import MyFridgePage from './pages/MyFridgePage'
import NavMenu from './components/NavMenu'
import NotFoundMessage from './components/NotFoundMessage'
import RecipePage from './pages/RecipePage'
import UserContext from './contexts/UserContext'

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
    { path: '/findrecipes', element: <FindRecipesPage />, name: 'Find Recipes' }
  ]
  const nonNavRoutes = [
    { path: '/recipe/:id', element: <RecipePage /> },
    { path: '*', element: <NotFoundMessage /> }
  ]

  // TODO: Login to set fridge ID
  const [userState, setUserState] = React.useState({ fridgeId: 1 })

  return (
    <BrowserRouter>
      <UserContext.Provider value={userState}>
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
