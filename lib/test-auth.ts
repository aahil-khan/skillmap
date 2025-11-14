// Test function to verify JWT authentication is working
export async function testAuth() {
  const token = localStorage.getItem('sb-jwt')
  console.log('Testing authentication...')
  console.log('Token exists:', !!token)
  
  if (!token) {
    console.log('No JWT token found in localStorage')
    return false
  }
  
  console.log('Token preview:', token.substring(0, 50) + '...')
  
  try {
    const response = await fetch('http://localhost:5005/health', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Health check with auth - Status:', response.status)
    console.log('Health check with auth - OK:', response.ok)
    
    const data = await response.json()
    console.log('Health check response:', data)
    
    return response.ok
  } catch (error) {
    console.error('Auth test failed:', error)
    return false
  }
}

// You can call this function from the browser console: window.testAuth()
if (typeof window !== 'undefined') {
  (window as any).testAuth = testAuth
}
