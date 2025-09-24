import React from 'react'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import TeacherLogin from './pages/teachers/TeacherLogin'
import StudentLogin from './pages/students/StudentLogin'



const App = () => {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path='/student/login' element={<StudentLogin/>}/>
      <Route path='/teacher/login' element={<TeacherLogin/>}/>
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App