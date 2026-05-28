import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './styles.css'

const LOADER_IMAGE_SIZE = {
	width: 250,
	height: 300,
}

const LOADER_TIMING = {
	krisDelay: 0,
	counterDelay: 0.3,
	textEnterDuration: 0.65,
	counterDuration: 1.25,
	imageRevealStart: 0.38,
	stackRevealStart: 1.02,
	firstImageDuration: 0.55,
	stackImageDuration: 0.35,
	stackImageStagger: 0.08,
	imageCloseStart: 2.65,
	imageCloseDuration: 0.35,
	textExitStart: 3.05,
	textExitDuration: 0.5,
	loaderFadeStart: 3.5,
}

const LOADER_IMAGES = Array.from(
	{ length: 8 },
	(_, index) => `/images/img${index + 1}.jpeg`,
)

const formatCounter = (value) => {
	const roundedValue = Math.round(value)

	if (roundedValue >= 100) return '100'

	return String(roundedValue).padStart(2, '0')
}

function LoadingScreen({ onComplete }) {
	const loaderRef = useRef(null)
	const krisTextRef = useRef(null)
	const counterTextRef = useRef(null)
	const firstImageRef = useRef(null)
	const stackedImagesRef = useRef([])
	const onCompleteRef = useRef(onComplete)

	useEffect(() => {
		onCompleteRef.current = onComplete
	}, [onComplete])

	useEffect(() => {
		const counterValue = { value: 0 }
		const stackedImages = stackedImagesRef.current.filter(Boolean)
		const allImages = [firstImageRef.current, ...stackedImages].filter(Boolean)
		const ctx = gsap.context(() => {
			gsap.set([krisTextRef.current, counterTextRef.current], {
				yPercent: 115,
			})
			gsap.set(firstImageRef.current, {
				height: 0,
			})
			gsap.set(stackedImages, {
				autoAlpha: 0,
				scale: 0,
				height: LOADER_IMAGE_SIZE.height,
			})

			const timeline = gsap.timeline({
				defaults: { ease: 'power3.out' },
				onComplete: () => onCompleteRef.current?.(),
			})

			timeline
				.to(
					krisTextRef.current,
					{
						yPercent: 0,
						duration: LOADER_TIMING.textEnterDuration,
					},
					LOADER_TIMING.krisDelay,
				)
				.to(
					counterTextRef.current,
					{
						yPercent: 0,
						duration: LOADER_TIMING.textEnterDuration,
					},
					LOADER_TIMING.counterDelay,
				)
				.to(
					counterValue,
					{
						value: 100,
						duration: LOADER_TIMING.counterDuration,
						ease: 'power4.out',
						onUpdate: () => {
							if (counterTextRef.current) {
								counterTextRef.current.textContent = formatCounter(
									counterValue.value,
								)
							}
						},
					},
					LOADER_TIMING.counterDelay,
				)
				.to(
					firstImageRef.current,
					{
						height: LOADER_IMAGE_SIZE.height,
						duration: LOADER_TIMING.firstImageDuration,
						ease: 'power4.inOut',
					},
					LOADER_TIMING.imageRevealStart,
				)
				.to(
					stackedImages,
					{
						autoAlpha: 1,
						scale: 1,
						duration: LOADER_TIMING.stackImageDuration,
						stagger: LOADER_TIMING.stackImageStagger,
						ease: 'back.out(1.6)',
					},
					LOADER_TIMING.stackRevealStart,
				)
				.set(
					allImages,
					{
						top: 0,
						bottom: 'auto',
					},
					LOADER_TIMING.imageCloseStart,
				)
				.set(
					allImages.map((element) => element.querySelector('img')),
					{
						top: 0,
						bottom: 'auto',
					},
					LOADER_TIMING.imageCloseStart,
				)
				.to(
					allImages,
					{
						height: 0,
						duration: LOADER_TIMING.imageCloseDuration,
						stagger: 0.03,
						ease: 'power4.inOut',
					},
					LOADER_TIMING.imageCloseStart,
				)
				.to(
					[krisTextRef.current, counterTextRef.current],
					{
						yPercent: -115,
						duration: LOADER_TIMING.textExitDuration,
						ease: 'power3.in',
					},
					LOADER_TIMING.textExitStart,
				)
				.to(
					loaderRef.current,
					{
						autoAlpha: 0,
						duration: 0.2,
						ease: 'power1.out',
					},
					LOADER_TIMING.loaderFadeStart,
				)
		}, loaderRef)

		return () => ctx.revert()
	}, [])

	return (
		<div
			ref={loaderRef}
			className="loading-screen"
			style={{
				'--loader-image-width': `${LOADER_IMAGE_SIZE.width}px`,
				'--loader-image-height': `${LOADER_IMAGE_SIZE.height}px`,
			}}
			aria-label="Loading homepage"
			role="status"
		>
			<div className="loading-screen__content">
				<div className="loading-screen__text" aria-live="polite">
					<span className="loading-screen__mask">
						<span ref={krisTextRef} className="loading-screen__word">
							Kris
						</span>
					</span>
					<span className="loading-screen__mask">
						<span ref={counterTextRef} className="loading-screen__counter">
							00
						</span>
					</span>
				</div>

				<div className="loading-screen__image-stage" aria-hidden="true">
					<div ref={firstImageRef} className="loading-screen__first-image">
						<img src={LOADER_IMAGES[0]} alt="" draggable="false" />
					</div>

					{LOADER_IMAGES.slice(1).map((image, index) => (
						<div
							ref={(element) => {
								stackedImagesRef.current[index] = element
							}}
							className="loading-screen__stacked-image"
							key={image}
						>
							<img src={image} alt="" draggable="false" />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default LoadingScreen
