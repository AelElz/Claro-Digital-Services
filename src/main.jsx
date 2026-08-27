import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LocaleProvider } from './lib/locale.jsx'
import { RouterProvider } from './lib/router.jsx'

/*
 * Marks the document as scripted, synchronously, before the first render.
 *
 * Everything that hides content for an entrance is gated behind this class,
 * so a browser that never runs this line, or a bundle that fails to load,
 * shows the whole page instead of a column of invisible sections. The class
 * has to be set here rather than in an effect: an effect runs after the
 * first paint, which is one frame of visible content jumping to hidden.
 */
document.documentElement.classList.add('js')

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
