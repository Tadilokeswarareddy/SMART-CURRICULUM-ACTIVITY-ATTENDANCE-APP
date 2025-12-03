import React from 'react'
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import StudentHome from './pages/StudentHome'
import TeacherHome from './pages/TeacherHome'
import NotFound404 from './pages/NotFound404'
import './App.css'
import ProtectedRote from './components/ProtectedRoute'


const Logout=()=>{
  localStorage.clear()
  return <Navigate to='/login'/>
}


const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/studenthome' element={<ProtectedRote><StudentHome/></ProtectedRote>}/>
      <Route path='/teacherhome' element={<ProtectedRote><TeacherHome/></ProtectedRote>}/>
      <Route path='*' element={<NotFound404/>}/>
      <Route path='/logout' element={<Logout/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App