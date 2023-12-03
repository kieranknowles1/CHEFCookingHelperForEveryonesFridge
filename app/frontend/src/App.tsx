import { BrowserRouter, Route, Routes } from 'react-router-dom'
import React from 'react'

import HomePage from './pages/HomePage'
import MyFridgePage from './pages/MyFridgePage'
import NavMenu from './components/NavMenu'

function App (): React.JSX.Element {
  const routes = [
    { path: '/', element: <HomePage />, name: 'Home' },
    { path: '/fridge', element: <MyFridgePage />, name: 'My Fridge' }
  ]

  return (
    <BrowserRouter>
      <NavMenu items={routes} />
      <Routes>
        {routes.map(route =>
          <Route key={route.path} path={route.path} element={route.element} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
