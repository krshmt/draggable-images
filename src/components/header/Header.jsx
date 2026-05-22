import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './styles.css'

const MENU_LABEL_RETURN_DELAY = 760

const menuItems = [
	{ label: 'Projets', to: '/' },
	{ label: 'À propos', to: '/a-propos' },
	{ label: 'Contact', to: '/contact' },
]

const panelVariants = {
	closed: {
		width: '128px',
		height: '66px',
		padding: '8px 18px',
		transition: {
			duration: 0.58,
			ease: [0.76, 0, 0.24, 1],
			delay: 0.18,
		},
	},
	open: {
		width: '30vw',
		height: '90vh',
		padding: '8px 18px 2rem 5rem',
		transition: {
			duration: 0.78,
			ease: [0.76, 0, 0.24, 1],
			delay: 0.12,
			when: 'beforeChildren',
		},
	},
}

const contentVariants = {
	closed: {
		transition: {
			staggerChildren: 0.05,
			staggerDirection: -1,
		},
	},
	open: {
		transition: {
			delayChildren: 1,
			staggerChildren: 0.09,
		},
	},
}

const contentItemVariants = {
	closed: {
		opacity: 0,
		y: 20,
		transition: { duration: 0.24, ease: 'easeInOut' },
	},
	open: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] },
	},
}

const emailVariants = {
	closed: {
		opacity: 0,
		y: 20,
		transition: { duration: 0.24, ease: 'easeInOut' },
	},
	open: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1], delay: 1.22 },
	},
}

const circleVariants = {
	closed: {
		scale: 0.1,
		transition: { duration: 0.34, ease: 'easeInOut' },
	},
	open: {
		scale: 1,
		transition: { duration: 0.78, ease: [0.76, 0, 0.24, 1], delay: 0.12 },
	},
}

const crossVariants = {
	closed: {
		opacity: 0,
		scale: 0.6,
		transition: { duration: 0.16, ease: 'easeInOut' },
	},
	open: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.24, ease: 'easeInOut', delay: 0.78 },
	},
}

function Header() {
	const [isOpen, setIsOpen] = useState(false)
	const [isLabelVisible, setIsLabelVisible] = useState(true)
	const panelRef = useRef(null)
	const labelTimeoutRef = useRef(null)

	const clearLabelTimeout = useCallback(() => {
		if (!labelTimeoutRef.current) return

		window.clearTimeout(labelTimeoutRef.current)
		labelTimeoutRef.current = null
	}, [])

	const openMenu = useCallback(() => {
		clearLabelTimeout()
		setIsLabelVisible(false)
		setIsOpen(true)
	}, [clearLabelTimeout])

	const closeMenu = useCallback(() => {
		clearLabelTimeout()
		setIsOpen(false)
		labelTimeoutRef.current = window.setTimeout(() => {
			setIsLabelVisible(true)
			labelTimeoutRef.current = null
		}, MENU_LABEL_RETURN_DELAY)
	}, [clearLabelTimeout])

	const toggleMenu = useCallback(() => {
		if (isOpen) {
			closeMenu()
			return
		}

		openMenu()
	}, [closeMenu, isOpen, openMenu])

	useEffect(() => {
		if (!isOpen) return undefined

		const closeOnEscape = (event) => {
			if (event.key === 'Escape') {
				closeMenu()
			}
		}

		window.addEventListener('keydown', closeOnEscape)

		return () => {
			window.removeEventListener('keydown', closeOnEscape)
		}
	}, [closeMenu, isOpen])

	useEffect(() => clearLabelTimeout, [clearLabelTimeout])

	const handlePanelClick = (event) => {
		if (!isOpen) {
			toggleMenu()
			return
		}

		if (event.target === panelRef.current) {
			event.stopPropagation()
		}
	}

	return (
		<header
			className="site-header"
			data-menu-open={isOpen}
			onMouseDown={(event) => event.stopPropagation()}
			onMouseUp={(event) => event.stopPropagation()}
			onTouchStart={(event) => event.stopPropagation()}
			onTouchEnd={(event) => event.stopPropagation()}
		>
			<AnimatePresence>
				{isOpen && (
					<motion.button
						className="site-menu-backdrop"
						type="button"
						aria-label="Fermer le menu"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25, ease: 'easeInOut' }}
						onClick={closeMenu}
					/>
				)}
			</AnimatePresence>

			<Link className="site-logo" to="/" aria-label="Retour à l'accueil" onClick={closeMenu}>
				<img src="/favicon.svg" alt="" />
			</Link>

			<motion.div
				ref={panelRef}
				className="site-menu-panel"
				data-open={isOpen}
				variants={panelVariants}
				initial={false}
				animate={isOpen ? 'open' : 'closed'}
				role={isOpen ? 'dialog' : 'button'}
				aria-label={isOpen ? 'Navigation principale' : 'Ouvrir le menu'}
				aria-expanded={isOpen}
				tabIndex={0}
				onClick={handlePanelClick}
				onKeyDown={(event) => {
					if (!isOpen && (event.key === 'Enter' || event.key === ' ')) {
						event.preventDefault()
						toggleMenu()
					}
				}}
			>
				<div className="site-menu-top-row">
					<AnimatePresence initial={false}>
						{isLabelVisible && (
							<motion.span
								className="site-menu-label"
								initial={{ opacity: 1, y: 0 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.08, ease: 'easeInOut' }}
							>
								Menu
							</motion.span>
						)}
					</AnimatePresence>

					<motion.button
						className="site-menu-dot"
						type="button"
						aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
						variants={circleVariants}
						initial={false}
						animate={isOpen ? 'open' : 'closed'}
						tabIndex={isOpen ? 0 : -1}
						onClick={(event) => {
							event.stopPropagation()
							if (isOpen) {
								closeMenu()
							}
						}}
					>
						<motion.span className="site-menu-cross" variants={crossVariants}>
							<span />
							<span />
						</motion.span>
					</motion.button>
				</div>

				<motion.div
					className="site-menu-content"
					variants={contentVariants}
					initial={false}
					animate={isOpen ? 'open' : 'closed'}
				>
					<div className="site-menu-links-area">
						<nav className="site-menu-nav" aria-label="Navigation du site">
							{menuItems.map((item) => (
								<motion.div variants={contentItemVariants} key={item.label}>
									<Link to={item.to} onClick={closeMenu}>
										{item.label}
									</Link>
								</motion.div>
							))}
						</nav>
					</div>

					<motion.a
						className="site-menu-email"
						href="mailto:hello@studio.com"
						variants={emailVariants}
						onClick={closeMenu}
					>
						hello@studio.com
					</motion.a>
				</motion.div>
			</motion.div>
		</header>
	)
}

export default Header
