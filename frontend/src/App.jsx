import React from 'react'
import {BrowserRouter,Route,Routes,Navigate} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import StudentHome from './pages/StudentHome'
import TeacherHome from './pages/TeacherHome'
import NotFound404 from './pages/NotFound404'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Adminpanel from './pages/Adminpanel'


const Logout = () => {
  localStorage.clear();
  return <Navigate to="/login" />;
};
const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path="/studenthome" element={<ProtectedRoute allowedRoles={["student"]}><StudentHome /></ProtectedRoute>}/>
      <Route path="/teacherhome" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherHome /></ProtectedRoute>}/>
      <Route path='*' element={<NotFound404/>}/>
      <Route path='/logout' element={<Logout/>}/>
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Adminpanel /></ProtectedRoute>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App