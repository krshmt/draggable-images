import { useState } from 'react'
import { motion } from 'framer-motion'
import DraggableImagesDistortion from '../components/draggable-images-distortion'

const HOME_ENTRY_STORAGE_KEY = 'home-entry-animation-played'

const galleryVariants = {
	initial: { opacity: 0, scale: 1.25, filter: 'blur(18px)' },
	animate: {
		opacity: 1,
		scale: 1,
		filter: 'blur(0px)',
		transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
	},
	exit: {
		opacity: 0,
		scale: 0.96,
		filter: 'blur(16px)',
		transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
	},
}

const hasPlayedHomeEntryAnimation = () => {
	try {
		return window.localStorage.getItem(HOME_ENTRY_STORAGE_KEY) === 'true'
	} catch {
		return false
	}
}

const markHomeEntryAnimationAsPlayed = () => {
	try {
		window.localStorage.setItem(HOME_ENTRY_STORAGE_KEY, 'true')
	} catch {
		// localStorage can be unavailable in private or restricted contexts.
	}
}

const shouldPlayHomeEntryAnimation = () => {
	if (hasPlayedHomeEntryAnimation()) return false

	markHomeEntryAnimationAsPlayed()
	return true
}

function GalleryPage() {
	const [shouldPlayEntryAnimation] = useState(shouldPlayHomeEntryAnimation)

	return (
		<motion.main
			className="route-shell gallery-route"
			variants={galleryVariants}
			initial={shouldPlayEntryAnimation ? 'initial' : false}
			animate="animate"
			exit="exit"
		>
			<DraggableImagesDistortion />
		</motion.main>
	)
}

export default GalleryPage
