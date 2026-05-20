import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
	getProjectBySlug,
	getProjectIndexBySlug,
	projectsWithSlugs,
} from '../utils/projects.js'
import './ProjectDetail.css'

const pageVariants = {
	initial: { opacity: 0, y: 48, scale: 0.985, filter: 'blur(18px)' },
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			duration: 0.85,
			ease: [0.22, 1, 0.36, 1],
			when: 'beforeChildren',
			staggerChildren: 0.08,
		},
	},
	exit: {
		opacity: 0,
		y: -32,
		scale: 1.02,
		filter: 'blur(14px)',
		transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
	},
}

const itemVariants = {
	initial: { opacity: 0, y: 28 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
	},
}

function ProjectDetail() {
	const { slug } = useParams()
	const project = getProjectBySlug(slug)

	if (!project) {
		return <Navigate to="/" replace />
	}

	const projectIndex = getProjectIndexBySlug(slug)
	const nextProject = projectsWithSlugs[(projectIndex + 1) % projectsWithSlugs.length]
	const galleryImages = project.images || []

	return (
		<motion.main
			className="route-shell project-detail"
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
		>
			<div className="project-detail__grain">
				<section className="project-hero">
					<motion.div className="project-hero__media" variants={itemVariants}>
						<img src={`/${project.image}`} alt={project.title} />
					</motion.div>

					<motion.div className="project-hero__content" variants={itemVariants}>
						<div>
							<h1>{project.title}</h1>
							<p className="project-hero__year">{project.year}</p>
						</div>
						<p className="project-hero__description">{project.description}</p>
					</motion.div>
				</section>

				<section className="project-gallery" aria-label={`${project.title} images`}>
					{galleryImages.map((image, index) => (
						<motion.figure
							className="project-gallery__item"
							key={`${image}-${index}`}
							variants={itemVariants}
						>
							<img src={`/${image}`} alt={`${project.title} ${index + 1}`} />
						</motion.figure>
					))}
				</section>
			</div>
		</motion.main>
	)
}

export default ProjectDetail
