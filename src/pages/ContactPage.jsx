import { motion } from 'framer-motion'

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

function ContactPage() {
	return (
		<motion.main
			className="route-shell empty-route"
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
		/>
	)
}

export default ContactPage
