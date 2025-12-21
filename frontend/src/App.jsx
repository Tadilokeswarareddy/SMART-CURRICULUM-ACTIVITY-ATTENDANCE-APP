import React from 'react'
import './App.css'
import {BrowserRouter,Route,Routes,Navigate} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import StudentHome from './pages/StudentHome'
import TeacherHome from './pages/TeacherHome'
import NotFound404 from './pages/NotFound404'
import ProtectedRoute from './components/ProtectedRoute'
import Adminpanel from './pages/Adminpanel'
import Curriculum from './pages/StudentPages/Curriculum'
import Scanqr from './pages/StudentPages/Scanqr'
import MarkAttendance from './pages/TeacherPages/MarkAttendance'
import StudentProfile from './pages/StudentPages/StudentProfile'
import TeacherProfile from './pages/TeacherPages/TeacherProfile'
import TeacherMessagesMain from './pages/TeacherPages/TeacherMessagesMain'


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
      <Route path="/curriculum" element={<ProtectedRoute allowedRoles={["student"]}><Curriculum/></ProtectedRoute>}/>
      <Route path="/scanqr" element={<ProtectedRoute allowedRoles={["student"]}><Scanqr/></ProtectedRoute>}/>
      <Route path="/studentprofile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile/></ProtectedRoute>}/>
      <Route path="/teacherprofile" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherProfile /></ProtectedRoute>}/>
      <Route path="/teacherhome" element={<ProtectedRoute allowedRoles={["teacher"]}><MarkAttendance /></ProtectedRoute>}/>
      <Route path="/teachermessages" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherMessagesMain /></ProtectedRoute>}/>
      <Route path="/markattendance" element={<ProtectedRoute allowedRoles={["teacher"]}><MarkAttendance /></ProtectedRoute>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
