import { motion } from 'framer-motion'
import DraggableImagesDistortion from '../components/draggable-images-distortion'

const galleryVariants = {
	initial: { opacity: 0, scale: 1.04, filter: 'blur(18px)' },
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

function GalleryPage() {
	return (
		<motion.main
			className="route-shell gallery-route"
			variants={galleryVariants}
			initial="initial"
			animate="animate"
			exit="exit"
		>
			<DraggableImagesDistortion />
		</motion.main>
	)
}

export default GalleryPage
