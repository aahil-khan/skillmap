// Utility function to completely flush Supabase auth cache
// Run this in browser console: window.flushSupabaseAuth()

import { supabase } from './supabase'

declare global {
  interface Window {
    flushSupabaseAuth: () => Promise<void>
  }
}

export const flushSupabaseAuth = async () => {
  console.log('🧹 Starting complete Supabase auth flush...')
  
  try {
    // 1. Sign out from Supabase
    console.log('1. Signing out from Supabase...')
    await supabase.auth.signOut()
    
    // 2. Clear all browser storage
    console.log('2. Clearing all browser storage...')
    localStorage.clear()
    sessionStorage.clear()
    
    // 3. Clear IndexedDB (where Supabase might store data)
    console.log('3. Clearing IndexedDB...')
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases()
      await Promise.all(
        databases.map(db => {
          if (db.name) {
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!)
              deleteReq.onsuccess = () => resolve(true)
              deleteReq.onerror = () => reject(deleteReq.error)
            })
          }
        })
      )
    }
    
    // 4. Clear service worker cache if exists
    console.log('4. Clearing service worker caches...')
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
    // 5. Clear cookies (Supabase related)
    console.log('5. Clearing auth cookies...')
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      if (name.trim().includes('supabase') || name.trim().includes('sb-')) {
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      }
    })
    
    console.log('✅ Supabase auth flush complete!')
    console.log('🔄 Reloading page in 1 second...')
    
    setTimeout(() => {
      window.location.reload()
    }, 1000)
    
  } catch (error) {
    console.error('❌ Error during auth flush:', error)
  }
}

// Make it available globally for console use
if (typeof window !== 'undefined') {
  window.flushSupabaseAuth = flushSupabaseAuth
}
