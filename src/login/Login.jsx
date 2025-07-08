import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        username,
        password
      })

      localStorage.setItem('token', response.data.token)
      console.log('Login success:', response.data)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center px-4">
      <form 
        onSubmit={handleLogin} 
        className="bg-[#F5F3EE] max-w-xs w-full"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <h2 className="text-center font-bold text-[#837958] mb-6 text-xl">เข้าสู่ระบบ</h2>

        <label className="block text-[10px] mb-1 text-[#BC9D72] font-semibold" htmlFor="username">
          Username<span className="text-[#BC9D72]">*</span>
        </label>
        <input
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="w-full text-xs p-2 rounded border border-[#BC9D72] mb-4 focus:outline-none focus:ring-1 focus:ring-[#837958]"
        />

        <label className="block text-[10px] mb-1 text-[#BC9D72] font-semibold" htmlFor="password">
          Password<span className="text-[#BC9D72]">*</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full text-xs p-2 rounded border border-[#BC9D72] mb-6 focus:outline-none focus:ring-1 focus:ring-[#837958]"
        />

        <button
          type="submit"
          className="w-full bg-[#837958] text-[#F5F3EE] text-xs font-semibold py-2 rounded"
        >
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  )
}

export default Login
