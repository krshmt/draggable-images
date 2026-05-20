import { useEffect, useRef } from 'react'
import './App.css'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import GalleryPage from './pages/GalleryPage.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'

function App() {
  const location = useLocation()
  const lenisRef = useRef(null)

  useEffect(() => {
    let frameId
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.25,
    })
    lenisRef.current = lenis

    const raf = (time) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }

    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
  }, [location.pathname])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
