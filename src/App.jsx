import { useEffect, useRef } from 'react'
import './App.css'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import GalleryPage from './pages/GalleryPage.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import AboutPage from './pages/AboutPage.jsx'
import Header from './components/header/Header.jsx'

function App() {
  const location = useLocation()
  const lenisRef = useRef(null)
  const previousPathRef = useRef(location.pathname)

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
    if (!('scrollRestoration' in window.history)) return undefined

    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useEffect(() => {
    if (previousPathRef.current === location.pathname) return undefined

    previousPathRef.current = location.pathname

    const timeoutId = window.setTimeout(() => {
      lenisRef.current?.scrollTo(0, { immediate: true, force: true })
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, 520)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [location.pathname])

  return (
    <>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/project/:slug" element={<ProjectDetail />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
