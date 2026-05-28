import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const isElementActive = (element) => {
	if (!element) return false

	const rect = element.getBoundingClientRect()
	const viewportHeight = window.innerHeight || 1
	const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
	const visibleRatio = clamp(visibleHeight / Math.min(rect.height, viewportHeight), 0, 1)

	return visibleRatio > 0.55 && rect.top < viewportHeight * 0.72
}

export function useScrollProgressNavigation({
	sectionRef,
	onComplete,
	threshold = 1,
	minVelocity = 0.48,
	intensity = 0.00145,
	decay = 0.72,
	idleDelay = 140,
} = {}) {
	const [progress, setProgress] = useState(0)
	const [isCharging, setIsCharging] = useState(false)
	const progressRef = useRef(0)
	const lastWheelRef = useRef(0)
	const lastFrameRef = useRef(0)
	const triggeredRef = useRef(false)
	const onCompleteRef = useRef(onComplete)

	useEffect(() => {
		onCompleteRef.current = onComplete
	}, [onComplete])

	const setProgressValue = useCallback((value) => {
		const nextProgress = clamp(value, 0, threshold)
		progressRef.current = nextProgress
		setProgress(nextProgress / threshold)
	}, [threshold])

	useEffect(() => {
		const handleWheel = (event) => {
			if (triggeredRef.current || !isElementActive(sectionRef?.current)) return

			const deltaY = event.deltaY
			if (deltaY <= 0) return

			const now = performance.now()
			const elapsed = Math.max(now - (lastWheelRef.current || now - 16), 16)
			const velocity = Math.abs(deltaY) / elapsed

			lastWheelRef.current = now

			if (velocity < minVelocity) {
				setIsCharging(false)
				return
			}

			setIsCharging(true)

			const velocityBoost = clamp(velocity / minVelocity, 1, 4.2)
			const deltaProgress = Math.abs(deltaY) * intensity * velocityBoost
			const nextProgress = progressRef.current + deltaProgress

			setProgressValue(nextProgress)

			if (nextProgress >= threshold) {
				triggeredRef.current = true
				setProgressValue(threshold)
				onCompleteRef.current?.()
			}
		}

		window.addEventListener('wheel', handleWheel, { passive: true })

		return () => {
			window.removeEventListener('wheel', handleWheel)
		}
	}, [intensity, minVelocity, sectionRef, setProgressValue, threshold])

	useEffect(() => {
		let frameId

		const tick = (time) => {
			const elapsed = lastFrameRef.current ? (time - lastFrameRef.current) / 1000 : 0
			lastFrameRef.current = time

			const idleTime = time - lastWheelRef.current

			if (!triggeredRef.current && progressRef.current > 0 && idleTime > idleDelay) {
				const nextProgress = progressRef.current - decay * elapsed
				setProgressValue(nextProgress)
				if (nextProgress <= 0.001) {
					setProgressValue(0)
					setIsCharging(false)
				}
			}

			frameId = requestAnimationFrame(tick)
		}

		frameId = requestAnimationFrame(tick)

		return () => {
			cancelAnimationFrame(frameId)
		}
	}, [decay, idleDelay, setProgressValue])

	return {
		progress,
		isCharging,
	}
}
