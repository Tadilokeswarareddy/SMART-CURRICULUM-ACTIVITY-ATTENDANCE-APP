import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'
import api from '../api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error,Seterror]=useState('')

  const SendRequest =async(e) => {
    e.preventDefault()
    try{
      const response = await api.post("/api/token/",{
        username,password
      })
      localStorage.setItem(ACCESS_TOKEN,response.data.access)
      localStorage.setItem(REFRESH_TOKEN,response.data.refresh)
      const role = response.data.role
      
      setUsername('')
      setPassword('')
      if (role === 'student'){
        navigate('/studenthome')

      }else if(role === 'teacher'){
        navigate('/teacherhome')

      }else{
        navigate('/admin')
      }


    }
    catch(error){
      Seterror(error)
      

    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={SendRequest} className="bg-black text-white p-8 rounded-xl shadow-lg w-80 space-y-5">
        <h1 className="text-center text-2xl font-bold mb-4">Login</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 rounded-md bg-white text-black border border-black "/>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 rounded-md bg-white text-black border border-black"/>
        <h1 className='text-white'>{error}</h1>
        <button type="submit" className="w-full p-2 rounded-md bg-white text-black border border-white font-semibold">Submit</button>
        
      </form>
    </div>
  )
}

export default LoginPage
