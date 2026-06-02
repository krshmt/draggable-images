import { useCallback, useEffect, useRef, useState } from 'react'
import TrailContainer from '../../source/TrailContainer'
import './styles.css'

const TRAIL_DURATION = 4000
const TRAIL_IMAGE_LIFESPAN = 1000
const TRAIL_LAYER_COUNT = 10
const TRAIL_OUT_DURATION = 1000
const TRAIL_STAGGER_OUT = 25
const TRAIL_REMOVE_BUFFER = 112

const TRAIL_CENTER_LAYER = (TRAIL_LAYER_COUNT - 1) / 2
const TRAIL_MAX_OUT_STAGGER = Math.max(
	...Array.from(
		{ length: TRAIL_LAYER_COUNT },
		(_, index) =>
			(TRAIL_CENTER_LAYER - Math.abs(index - TRAIL_CENTER_LAYER)) *
			TRAIL_STAGGER_OUT,
	),
)
const TRAIL_IMAGE_COMPLETE_DURATION =
	TRAIL_IMAGE_LIFESPAN + TRAIL_MAX_OUT_STAGGER + TRAIL_OUT_DURATION + TRAIL_REMOVE_BUFFER
const PROGRESS_STEPS = [
	{ time: 0, value: 0 },
	{ time: 0.08, value: 7 },
	{ time: 0.18, value: 18 },
	{ time: 0.25, value: 24 },
	{ time: 0.31, value: 24 },
	{ time: 0.44, value: 47 },
	{ time: 0.52, value: 54 },
	{ time: 0.58, value: 54 },
	{ time: 0.72, value: 76 },
	{ time: 0.8, value: 82 },
	{ time: 0.86, value: 82 },
	{ time: 0.94, value: 94 },
	{ time: 1, value: 100 },
]

const easeInOutCubic = (value) =>
	value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2

const getProgressValue = (elapsed) => {
	const progress = Math.min(elapsed / TRAIL_DURATION, 1)

	for (let index = 0; index < PROGRESS_STEPS.length - 1; index += 1) {
		const currentStep = PROGRESS_STEPS[index]
		const nextStep = PROGRESS_STEPS[index + 1]

		if (progress < currentStep.time || progress > nextStep.time) continue

		const stepDuration = nextStep.time - currentStep.time
		const localProgress =
			stepDuration === 0 ? 1 : (progress - currentStep.time) / stepDuration
		const easedProgress = easeInOutCubic(localProgress)

		return Math.round(
			currentStep.value +
				(nextStep.value - currentStep.value) * easedProgress,
		)
	}

	return 100
}

function LoadingPage({ onComplete }) {
	const loaderRef = useRef(null)
	const hasCompletedRef = useRef(false)
	const [phase, setPhase] = useState('active')
	const [loadingProgress, setLoadingProgress] = useState(0)
	const isAcceptingTrailInput = phase === 'active'

	const completeLoading = useCallback(() => {
		if (hasCompletedRef.current) return

		hasCompletedRef.current = true
		onComplete?.()
	}, [onComplete])

	useEffect(() => {
		const trailTimer = window.setTimeout(() => {
			setPhase('draining')
		}, TRAIL_DURATION)

		return () => {
			window.clearTimeout(trailTimer)
		}
	}, [])

	useEffect(() => {
		let frameId
		const startedAt = performance.now()

		const updateProgress = (now) => {
			const elapsed = now - startedAt
			const nextProgress = getProgressValue(elapsed)

			setLoadingProgress((currentProgress) =>
				currentProgress === nextProgress ? currentProgress : nextProgress,
			)

			if (elapsed < TRAIL_DURATION) {
				frameId = window.requestAnimationFrame(updateProgress)
			} else {
				setLoadingProgress(100)
			}
		}

		frameId = window.requestAnimationFrame(updateProgress)

		return () => {
			window.cancelAnimationFrame(frameId)
		}
	}, [])

	useEffect(() => {
		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = previousOverflow
		}
	}, [])

	useEffect(() => {
		if (isAcceptingTrailInput) return undefined

		const blockTrailMouseMove = (event) => {
			event.stopPropagation()
			event.stopImmediatePropagation?.()
		}

		document.addEventListener('mousemove', blockTrailMouseMove, true)

		return () => {
			document.removeEventListener('mousemove', blockTrailMouseMove, true)
		}
	}, [isAcceptingTrailInput])

	useEffect(() => {
		if (phase !== 'draining') return undefined

		const loader = loaderRef.current
		if (!loader) {
			completeLoading()
			return undefined
		}

		const hasTrailImages = () => loader.querySelectorAll('.trail-img').length > 0

		const completeWhenTrailIsClear = () => {
			if (!hasTrailImages()) {
				completeLoading()
			}
		}

		const observer = new MutationObserver(completeWhenTrailIsClear)
		observer.observe(loader, { childList: true, subtree: true })

		const fallbackTimer = window.setTimeout(
			completeLoading,
			TRAIL_IMAGE_COMPLETE_DURATION,
		)

		completeWhenTrailIsClear()

		return () => {
			observer.disconnect()
			window.clearTimeout(fallbackTimer)
		}
	}, [completeLoading, phase])

	return (
		<section
			ref={loaderRef}
			className={`loading-page loading-page--${phase}`}
			aria-busy="true"
			aria-label="Chargement"
		>
			<div className="loading-page__trail" aria-hidden="true">
				<TrailContainer />
			</div>
			<div className="loading-page__progress" role="status" aria-live="polite">
				<span
					key={loadingProgress}
					className="loading-page__progress-value"
				>
					{String(loadingProgress).padStart(3, '0')}
				</span>
			</div>
			<span className="loading-page__sr-only">Chargement</span>
		</section>
	)
}

export default LoadingPage
