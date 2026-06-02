import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useScrollProgressNavigation } from '../../hooks/useScrollProgressNavigation.js'
import './styles.css'

const sectionVariants = {
	initial: { opacity: 0, filter: 'blur(10px)' },
	animate: {
		opacity: 1,
		filter: 'blur(0px)',
		transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
	},
	exit: {
		opacity: 0,
		scale: 0.985,
		filter: 'blur(14px)',
		transition: { duration: 0.38, ease: [0.76, 0, 0.24, 1] },
	},
}

function NextProjectSection({ project }) {
	const sectionRef = useRef(null)
	const navigate = useNavigate()
	const [isLeaving, setIsLeaving] = useState(false)

	const goToNextProject = useCallback(() => {
		setIsLeaving(true)
		window.setTimeout(() => {
			navigate(project.href)
		}, 360)
	}, [navigate, project.href])

	const { progress, isCharging } = useScrollProgressNavigation({
		sectionRef,
		onComplete: goToNextProject,
		minVelocity: 0.62,
		intensity: 0.00025,
		decay: 0.68,
	})

	return (
		<motion.section
			ref={sectionRef}
			className={`next-project ${isCharging ? 'is-charging' : ''}`}
			variants={sectionVariants}
			initial="initial"
			whileInView="animate"
			animate={isLeaving ? 'exit' : undefined}
			viewport={{ once: false, amount: 0.5 }}
			aria-labelledby="next-project-title"
		>
			<div className="next-project__content">
				<Link className="next-project__home" to="/">
					Back to the homepage
				</Link>


				<div className="next-project__media">
					<img src={`/${project.image}`} alt="" aria-hidden="true" />
				</div>

				<h2 id="next-project-title" className="next-project__title">
					{project.title}
				</h2>
				<p className="next-project__eyebrow">Scroll for the next project</p>
			</div>

			<div
				className="next-project__progress"
				aria-label="Progression vers le projet suivant"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={Math.round(progress * 100)}
				role="progressbar"
			>
				<span style={{ transform: `scaleY(${progress})` }} />
			</div>
		</motion.section>
	)
}

export default NextProjectSection
