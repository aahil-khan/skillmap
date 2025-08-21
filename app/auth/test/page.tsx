"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthTestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullname, setFullname] = useState("")
  const [status, setStatus] = useState("")

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) {
        setStatus(`Connection Error: ${error.message}`)
      } else {
        setStatus("✅ Supabase connection successful")
      }
    } catch (err) {
      setStatus(`Error: ${err}`)
    }
  }

  const testSignup = async () => {
    setStatus("Testing signup...")
    try {
      // First, try just auth signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        setStatus(`Auth Error: ${error.message}`)
        return
      }

      setStatus(`✅ Auth signup successful. User ID: ${data.user?.id}`)
      
      // Now try inserting into users table
      if (data.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullname
            }
          ])
        
        if (insertError) {
          setStatus(`❌ Database insert failed: ${insertError.message}`)
        } else {
          setStatus("✅ Complete signup successful!")
        }
      }
    } catch (err) {
      setStatus(`❌ Unexpected error: ${err}`)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testConnection}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Test Supabase Connection
        </button>
        
        <input
          type="text"
          placeholder="Full Name"
          value={fullname}
          onChange={e => setFullname(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        
        <button 
          onClick={testSignup}
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Test Signup
        </button>
        
        <div className="p-4 bg-gray-100 rounded min-h-20">
          <strong>Status:</strong>
          <pre className="text-sm mt-2">{status}</pre>
        </div>
      </div>
    </div>
  )
}
