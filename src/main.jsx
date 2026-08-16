import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LocaleProvider } from './lib/locale.jsx'
import { RouterProvider } from './lib/router.jsx'

/*
 * Locale outside the router, not inside it. Routes are the same in both
 * languages, so switching language must not remount the page you are on: it
 * swaps the copy underneath you and leaves the URL, the scroll position and
 * the sticky stack exactly where they were.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocaleProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </LocaleProvider>
  </StrictMode>,
)
