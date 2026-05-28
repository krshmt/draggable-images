import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import './AboutPage.css'

const smudgeConfig = {
	smoothing: 0.1,
	movementThreshold: 0.01,
	sizeFromSpeed: 0.2,
	expandMultiplier: 2,
	expandTime: 2,
	expandEase: 'power1.inOut',
	dissolveStart: 2,
	dissolveTime: 3,
	dissolveEase: 'power3.in',
}

const pageVariants = {
	initial: { opacity: 0, y: 24 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
	},
	exit: {
		opacity: 0,
		y: -18,
		transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
	},
}

function AboutPage() {
	const heroRef = useRef(null)
	const smudgeContainerRef = useRef(null)
	const frameRef = useRef(null)
	const timelinesRef = useRef(new Set())
	const pointerRef = useRef({ x: 0, y: 0 })
	const smoothPointerRef = useRef({ x: 0, y: 0 })
	const hasStartedRef = useRef(false)

	const updatePointer = useCallback((clientX, clientY) => {
		const hero = heroRef.current
		if (!hero) return

		const rect = hero.getBoundingClientRect()
		const x = clientX - rect.left
		const y = clientY - rect.top
		const pointer = pointerRef.current
		const smoothPointer = smoothPointerRef.current

		if (!hasStartedRef.current) {
			pointer.x = smoothPointer.x = x
			pointer.y = smoothPointer.y = y
			hasStartedRef.current = true
			return
		}

		pointer.x = x
		pointer.y = y
	}, [])

	const stampSmudgeAt = useCallback((x, y, radius) => {
		const smudgeContainer = smudgeContainerRef.current
		if (!smudgeContainer) return

		const circle = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'circle',
		)

		circle.setAttribute('cx', x)
		circle.setAttribute('cy', y)
		circle.setAttribute('r', radius)
		circle.setAttribute('fill', '#fff')

		smudgeContainer.prepend(circle)

		const animatedRadius = { current: radius }
		const timeline = gsap.timeline({
			onUpdate() {
				circle.setAttribute('r', Math.max(0, animatedRadius.current))
			},
			onComplete() {
				timeline.kill()
				timelinesRef.current.delete(timeline)
				circle.remove()
			},
		})

		timelinesRef.current.add(timeline)

		timeline.to(animatedRadius, {
			current: radius * smudgeConfig.expandMultiplier,
			duration: smudgeConfig.expandTime,
			ease: smudgeConfig.expandEase,
		})

		timeline.to(
			animatedRadius,
			{
				current: 0,
				duration: smudgeConfig.dissolveTime,
				ease: smudgeConfig.dissolveEase,
			},
			smudgeConfig.dissolveStart,
		)
	}, [])

	useEffect(() => {
		const timelines = timelinesRef.current
		const smudgeContainer = smudgeContainerRef.current

		const update = () => {
			if (hasStartedRef.current) {
				const pointer = pointerRef.current
				const smoothPointer = smoothPointerRef.current

				smoothPointer.x +=
					(pointer.x - smoothPointer.x) * smudgeConfig.smoothing
				smoothPointer.y +=
					(pointer.y - smoothPointer.y) * smudgeConfig.smoothing

				const speed = Math.hypot(
					pointer.x - smoothPointer.x,
					pointer.y - smoothPointer.y,
				)

				if (speed > smudgeConfig.movementThreshold) {
					stampSmudgeAt(
						smoothPointer.x,
						smoothPointer.y,
						speed * smudgeConfig.sizeFromSpeed,
					)
				}
			}

			frameRef.current = window.requestAnimationFrame(update)
		}

		frameRef.current = window.requestAnimationFrame(update)

		return () => {
			if (frameRef.current) {
				window.cancelAnimationFrame(frameRef.current)
			}

			timelines.forEach((timeline) => timeline.kill())
			timelines.clear()
			smudgeContainer?.replaceChildren()
		}
	}, [stampSmudgeAt])

	return (
		<motion.main
			className="route-shell about-route"
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
		>
			<section
				ref={heroRef}
				className="about-smudge-hero"
				onPointerMove={(event) => updatePointer(event.clientX, event.clientY)}
				onPointerDown={(event) => updatePointer(event.clientX, event.clientY)}
			>
				<div className="about-hero-content-foreground">
					<h1>about</h1>
				</div>

				<div className="about-hero-content-background">
					<h3>
						I'm Kris, a junior front-end developer based in Orléans. I develop interactive web experiences to prepare for my return to school in 2027.
					</h3>
				</div>

				<svg
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="none"
					className="about-smudge-revealer"
					aria-hidden="true"
				>
					<defs>
						<filter id="about-smudge-goo">
							<feGaussianBlur in="SourceGraphic" stdDeviation="25" />
							<feColorMatrix
								type="matrix"
								values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -14"
							/>
						</filter>
					</defs>
					<mask id="about-smudge-mask">
						<g
							ref={smudgeContainerRef}
							className="about-smudge-blobs"
							filter="url(#about-smudge-goo)"
						/>
					</mask>
				</svg>
			</section>
		</motion.main>
	)
}

export default AboutPage
