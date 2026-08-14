import { useEffect, useRef } from 'react'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import Formula from '../components/Formula'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import Sectors from '../components/Sectors'
import Services from '../components/Services'
import Testimonial from '../components/Testimonial'
import Work from '../components/Work'
import { usePanelStack } from '../hooks/usePanelStack'
import { initHistoryNav } from '../lib/motion'

/*
 * Chapters alternate dark -> light all the way down, so the black and the
 * off-white end up roughly balanced across the page. The alternation is what
 * carries the rhythm, individual elements are never tinted to fake it.
 *
 * The panel stack is set up here rather than in App, so mounting and
 * unmounting this page tears the sticky offsets and the ticker subscription
 * down with it.
 */
function Home() {
  const stackRef = useRef(null)

  usePanelStack(stackRef)
  useEffect(() => initHistoryNav(), [])

  return (
    <>
      <Navbar />

      <main ref={stackRef}>
        <Hero />
        <Formula />
        <Services />
        <Sectors />
        <Work />
        <Testimonial />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

export default Home
