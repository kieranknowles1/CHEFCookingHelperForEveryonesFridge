import { BrowserRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

import HomePage from './pages/HomePage'
import MyFridgePage from './pages/MyFridgePage'
import NavMenu from './components/NavMenu'
import UserContext from './UserContext'

function App (): React.JSX.Element {
  const routes = [
    { path: '/', element: <HomePage />, name: 'Home' },
    { path: '/fridge', element: <MyFridgePage />, name: 'My Fridge' }
  ]

  // TODO: Login to set fridge ID
  const [userState, setUserState] = React.useState({ fridgeId: 1 })

  return (
    <BrowserRouter>
      <UserContext.Provider value={userState}>
        <NavMenu items={routes} />
        <Routes>
          {routes.map(route =>
            <Route key={route.path} path={route.path} element={route.element} />
          )}
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  )
}

export default App
