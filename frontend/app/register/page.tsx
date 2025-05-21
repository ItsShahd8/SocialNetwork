'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    dob: '',
    avatar_url: '',
    nickname: '',
    about_me: '',
  })

  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('http://localhost:8080/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const text = await res.text()
    setMessage(text)
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border" />
        <input name="first_name" placeholder="First Name" onChange={handleChange} className="w-full p-2 border" />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} className="w-full p-2 border" />
        <input name="dob" type="date" onChange={handleChange} className="w-full p-2 border" />
        <input name="avatar_url" placeholder="Avatar URL" onChange={handleChange} className="w-full p-2 border" />
        <input name="nickname" placeholder="Nickname" onChange={handleChange} className="w-full p-2 border" />
        <textarea name="about_me" placeholder="About Me" onChange={handleChange} className="w-full p-2 border" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">Register</button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  )
}
