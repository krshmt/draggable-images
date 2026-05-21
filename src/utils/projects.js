import { projects } from '../data/data.js'

export const createProjectSlug = (title = '') =>
	title
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

const slugCounts = new Map()

export const projectsWithSlugs = projects.map((project) => {
	const baseSlug = createProjectSlug(project.title)
	const nextCount = (slugCounts.get(baseSlug) || 0) + 1
	slugCounts.set(baseSlug, nextCount)

	const slug = nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`

	return {
		...project,
		slug,
		href: `/project/${slug}`,
	}
})

export const getProjectBySlug = (slug) =>
	projectsWithSlugs.find((project) => project.slug === slug)

export const getProjectIndexBySlug = (slug) =>
	projectsWithSlugs.findIndex((project) => project.slug === slug)
