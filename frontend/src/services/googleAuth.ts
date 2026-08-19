/**
 * Google Identity Services (GIS) Native OAuth Service
 * Handles native Google account chooser popups & token exchange.
 */
import axios from 'axios'

declare global {
  interface Window {
    google?: any
  }
}

// Default fallback client ID if env variable is not injected during build
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '230253299719-4gn6bk0s1d4vmgs7pl7r56kt4042dau3.apps.googleusercontent.com'

/**
 * Dynamically loads the Google Identity Services SDK if not already present.
 */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      return resolve()
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    )

    if (existingScript) {
      if (window.google?.accounts?.oauth2) {
        return resolve()
      }
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google SDK')), { once: true })
      // Poll briefly in case script loaded before listener attached
      let checkCount = 0
      const interval = setInterval(() => {
        checkCount++
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval)
          resolve()
        } else if (checkCount > 30) {
          clearInterval(interval)
          reject(new Error('Google Identity Services script timeout.'))
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK.'))
    document.head.appendChild(script)
  })
}

export interface GoogleAuthResult {
  email: string
  name: string
  id_token?: string
  picture?: string
}

/**
 * Triggers the official, native Google Account Chooser popup.
 */
export async function triggerNativeGoogleSignIn(): Promise<GoogleAuthResult> {
  // Ensure GIS script is loaded
  try {
    await loadGsiScript()
  } catch (err) {
    console.error('Failed to load GIS script:', err)
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window context is unavailable.'))
    }

    // Use official Google Identity Services popup
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              return reject(new Error(tokenResponse.error_description || tokenResponse.error))
            }
            if (tokenResponse.access_token) {
              try {
                const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const data = userInfoRes.data
                return resolve({
                  email: data.email,
                  name: data.name || data.given_name || 'Google User',
                  picture: data.picture,
                  id_token: tokenResponse.id_token,
                })
              } catch (e) {
                return reject(new Error('Failed to fetch user profile from Google.'))
              }
            }
          },
        })

        client.requestAccessToken({ prompt: 'select_account' })
        return
      } catch (err: any) {
        return reject(new Error(err.message || 'Failed to initialize Google login.'))
      }
    }

    return reject(
      new Error('Google Client ID is missing or Google Identity SDK could not be loaded. Please check your network or environment settings.')
    )
  })
}

