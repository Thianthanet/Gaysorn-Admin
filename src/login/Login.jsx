import axios from 'axios'
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleCheck, CircleX } from "lucide-react";
import Swal from 'sweetalert2'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [popupStatus, setPopupStatus] = useState("");
  const [popupAlert, setPopupAlert] = useState("");

  useEffect(() => {
    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      // script.onload = renderTurnstile;
      document.head.appendChild(script);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกชื่อผู้ใช้ และรหัสผ่าน',
        confirmButtonColor: '#837958'
      })
      return
    }

    // ดึง token จาก hidden input
    const formData = new FormData(formRef.current)
    const captchaToken = formData.get('cf-turnstile-response')

    if (!captchaToken) {
      alert('Please complete CAPTCHA verification.')

      setLoading(false)
      return
    }

    // console.log("captchaToken in login react: ", captchaToken)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        username,
        password,
        'cf-turnstile-response': captchaToken,
      },
        {
          headers: { "Content-Type": "application/json" }
        }
      )
      // setPopupStatus("success");
      setTimeout(() => {
        // alert('Login successful!');
        // console.log("token: ", captchaToken)

        localStorage.setItem('token', response.data?.token)
        // setTimeout(() => setPopupStatus(null), 3000);
        // กรอกครบแล้ว ทำการ login
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          showConfirmButton: false,
          timer: 1500
        })
        console.log('Login success:', response.data)
        navigate('/dashboard')
      }, 2000);
    } catch (error) {
      // setPopupStatus("error");
      // กรอกครบแล้ว ทำการ login
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบล้มเหลว',
        text: 'กรุณาตรวจสอบชื่อผู้ใช้ และรหัสผ่านอีกครั้ง',
        confirmButtonText: 'ลองใหม่',
        confirmButtonColor: '#837958'
      })

      console.error('Login failed:', error)

      setTimeout(() => setPopupStatus(null), 3000);

      // ✅ Reset Turnstile widget เมื่อ login ผิด
      if (window.turnstile) {
        window.turnstile.reset();
      }

      // alert('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    //bg-[#F5F3EE]
    <div className="min-h-screen bg-contain bg-center bg-[url('/images/bg-adminLogin.png')] flex items-center justify-center">
      <form
        ref={formRef}
        onSubmit={handleLogin}
        //max-w-xs //backdrop-blur-lg
        className="bg-[#E5E5E5]/10 backdrop-blur-[2px] w-[368px] shadow-2xl rounded-2xl border border-white flex flex-col p-8"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        <img src="/images/logo-gaysorn.png" alt="Logo" className="w-12 mx-auto mb-4" />
        <h2 className="text-center font-bold text-[28px] mb-2 bg-gradient-to-r from-[#4f4833] to-[#fff1c7] bg-clip-text text-transparent">
          เข้าสู่ระบบ
        </h2>

        <label className="block text-[12px] mb-1 text-white font-semibold" htmlFor="username">
          Username<span className="text-red-500"> *</span>
        </label>
        <input
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          // required
          className="w-full text-xs p-3 rounded-full border border-[#837958] bg-white/50 mb-4 focus:outline-none focus:ring-1 focus:ring-[#837958] placeholder-[#BC9D72]"
        />

        <label className="block text-[12px] mb-1 text-white font-semibold" htmlFor="password">
          Password<span className="text-red-500"> *</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          // required
          className="w-full text-xs p-3 rounded-full border border-[#837958] bg-white/50 mb-4 focus:outline-none focus:ring-1 focus:ring-[#837958] placeholder-[#BC9D72]"
        />

        {/* Cloudflare Turnstile */}
        <div className="flex items-center justify-center mb-4">
          <div
            className="cf-turnstile"
            data-sitekey={import.meta.env.VITE_API_SITE_KEY}
            // data-sitekey="3x00000000000000000000FF"
            data-theme="light" F
          />
        </div>
        <div className='flex items-center justify-center'>
          <button
            type="submit"
            // disabled={loading}

            className="w-[104px] bg-white/60 text-[#837958] text-xs font-semibold py-3 shadow-2xl rounded-full hover:bg-[#837958] hover:text-white hover:shadow-2xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#837958] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </form>

      {popupStatus && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[320px] text-center">
            {popupStatus === "success" ? (
              <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                <CircleCheck size={50} className="mb-2" />
                <h2 className="text-lg font-semibold">
                  Login Success.
                </h2>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                <CircleX size={50} className="mb-2" />
                <h2 className="text-lg font-semibold">
                  Login failed.
                </h2>
                <h2 className="text-lg font-semibold">
                  Please check your credentials.
                </h2>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Login
