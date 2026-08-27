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
 * The seven chapters, in order, as one flow.
 *
 * Every chapter is black. The rhythm is carried by the fields and the space
 * between them, not by alternating ground; nothing here is tinted to fake it.
 *
 * On a wide screen usePanelStack turns this list into the layered stack, each
 * chapter pinning while the next slides over it. Below 1100px it does not
 * engage at all and these stay what the markup says they are: ordinary
 * stacked full-bleed sections.
 *
 * The stack is set up here rather than in App, so mounting and unmounting this
 * page tears the sticky offsets and the ticker subscription down with it.
 *
 * Home is the one route App does not split. It is where nearly every visit
 * starts, so it ships in the entry chunk and paints without a second request.
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
