import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js'
import { projectsWithSlugs } from '../../utils/projects.js'
import {
	deformationFragmentShader,
	deformationVertexShader,
} from './shaders.js'
import {
	createDragDeformationState,
	resetDragDeformation,
	settleDragDeformation,
	updateDragDeformationTarget,
} from './useDragDeformation.js'
import './styles.css'

const config = {
	cellSize: 0.75,
	zoomLevel: 1.25,
	lerpFactor: 0.075,
	deformationLerpFactor: 0.14,
	borderColor: 'rgba(255, 255, 255, 0.15)',
	backgroundColor: 'rgba(0, 0, 0, 1)',
	textColor: 'rgba(128, 128, 128, 1)',
	hoverColor: 'rgba(255, 255, 255, 0)',
}

const rgbaToArray = (rgba) => {
	const match = rgba.match(/rgba?\(([^)]+)\)/)
	if (!match) return [1, 1, 1, 1]
	return match[1]
		.split(',')
		.map((value, index) =>
			index < 3 ? parseFloat(value.trim()) / 255 : parseFloat(value.trim() || 1)
		)
}

const getProjectIndexFromCell = (cellX, cellY) => {
	const rawIndex = cellX + cellY * 3
	return ((rawIndex % projectsWithSlugs.length) + projectsWithSlugs.length) %
		projectsWithSlugs.length
}

const createTextTexture = (title, year) => {
	const canvas = document.createElement('canvas')
	canvas.width = 2048
	canvas.height = 256
	const ctx = canvas.getContext('2d')

	ctx.clearRect(0, 0, 2048, 256)
	ctx.font = '80px Poppins, Arial, sans-serif'
	ctx.fillStyle = config.textColor
	ctx.textBaseline = 'middle'
	ctx.imageSmoothingEnabled = false

	ctx.textAlign = 'left'
	ctx.fillText(title.toUpperCase(), 30, 128)
	ctx.textAlign = 'right'
	ctx.fillText(year.toString().toUpperCase(), 2048 - 30, 128)

	const texture = new THREE.CanvasTexture(canvas)
	Object.assign(texture, {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		flipY: false,
		generateMipmaps: false,
		format: THREE.RGBAFormat,
	})

	return texture
}

const createTextureAtlas = (textures, isText = false) => {
	const atlasSize = Math.ceil(Math.sqrt(textures.length))
	const textureSize = 512
	const canvas = document.createElement('canvas')
	canvas.width = canvas.height = atlasSize * textureSize
	const ctx = canvas.getContext('2d')

	if (isText) {
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	} else {
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
	}

	textures.forEach((texture, index) => {
		const x = (index % atlasSize) * textureSize
		const y = Math.floor(index / atlasSize) * textureSize

		if (isText && texture.source?.data) {
			ctx.drawImage(texture.source.data, x, y, textureSize, textureSize)
		} else if (!isText && texture.image?.complete) {
			ctx.drawImage(texture.image, x, y, textureSize, textureSize)
		}
	})

	const atlasTexture = new THREE.CanvasTexture(canvas)
	Object.assign(atlasTexture, {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		flipY: false,
	})

	return atlasTexture
}

const loadTextures = (textTextures) => {
	const textureLoader = new THREE.TextureLoader()
	const imageTextures = []
	let loadedCount = 0

	return new Promise((resolve) => {
		projectsWithSlugs.forEach((project) => {
			const texture = textureLoader.load(project.image, () => {
				if (++loadedCount === projectsWithSlugs.length) resolve(imageTextures)
			})

			Object.assign(texture, {
				wrapS: THREE.ClampToEdgeWrapping,
				wrapT: THREE.ClampToEdgeWrapping,
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
			})

			imageTextures.push(texture)
			textTextures.push(createTextTexture(project.title, project.year))
		})
	})
}

function DraggableImagesDistortion() {
	const galleryRef = useRef(null)
	const navigate = useNavigate()

	useEffect(() => {
		let scene
		let camera
		let renderer
		let plane
		let animationId
		let isMounted = true

		let isDragging = false
		let isClick = true
		let clickStartTime = 0
		const previousMouse = { x: 0, y: 0 }
		const offset = { x: 0, y: 0 }
		const targetOffset = { x: 0, y: 0 }
		const mousePosition = { x: -1, y: -1 }
		let zoomLevel = 1.0
		let targetZoom = 1.0
		const textTextures = []
		const dragDeformation = createDragDeformationState()

		const isHeaderEvent = (event) =>
			event.target instanceof Element && event.target.closest('.site-header')

		const updateMousePosition = (event) => {
			const rect = renderer.domElement.getBoundingClientRect()
			mousePosition.x = event.clientX - rect.left
			mousePosition.y = event.clientY - rect.top
			plane?.material.uniforms.uMousePos.value.set(
				mousePosition.x,
				mousePosition.y
			)
		}

		const startDrag = (x, y) => {
			isDragging = true
			isClick = true
			clickStartTime = Date.now()
			resetDragDeformation(dragDeformation)
			document.body.classList.add('dragging')
			previousMouse.x = x
			previousMouse.y = y
			window.setTimeout(() => isDragging && (targetZoom = config.zoomLevel), 150)
		}

		const handleMove = (currentX, currentY) => {
			if (!isDragging || currentX === undefined || currentY === undefined) return

			const deltaX = currentX - previousMouse.x
			const deltaY = currentY - previousMouse.y

			updateDragDeformationTarget(dragDeformation, deltaX, deltaY)

			if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
				isClick = false
				if (targetZoom === 1.0) targetZoom = config.zoomLevel
			}

			targetOffset.x -= deltaX * 0.003
			targetOffset.y += deltaY * 0.003
			previousMouse.x = currentX
			previousMouse.y = currentY
		}

		const onPointerDown = (event) => {
			if (isHeaderEvent(event)) return
			startDrag(event.clientX, event.clientY)
		}
		const onPointerMove = (event) => {
			if (isHeaderEvent(event)) return
			handleMove(event.clientX, event.clientY)
		}
		const onPointerUp = (event) => {
			if (isHeaderEvent(event)) return

			isDragging = false
			document.body.classList.remove('dragging')
			targetZoom = 1.0
			resetDragDeformation(dragDeformation)

			if (isClick && Date.now() - clickStartTime < 200) {
				const endX = event.clientX || event.changedTouches?.[0]?.clientX
				const endY = event.clientY || event.changedTouches?.[0]?.clientY

				if (endX !== undefined && endY !== undefined) {
					const rect = renderer.domElement.getBoundingClientRect()
					const screenX = ((endX - rect.left) / rect.width) * 2 - 1
					const screenY = -(((endY - rect.top) / rect.height) * 2 - 1)

					const radius = Math.sqrt(screenX * screenX + screenY * screenY)
					const distortion = 1.0 - 0.08 * radius * radius

					let worldX =
						screenX * distortion * (rect.width / rect.height) * zoomLevel +
						offset.x
					let worldY = screenY * distortion * zoomLevel + offset.y

					const cellX = Math.floor(worldX / config.cellSize)
					const cellY = Math.floor(worldY / config.cellSize)
					const actualIndex = getProjectIndexFromCell(cellX, cellY)

					if (projectsWithSlugs[actualIndex]?.href) {
						navigate(projectsWithSlugs[actualIndex].href)
					}
				}
			}
		}

		const onTouchStart = (event) => {
			if (isHeaderEvent(event)) return

			event.preventDefault()
			startDrag(event.touches[0].clientX, event.touches[0].clientY)
		}

		const onTouchMove = (event) => {
			if (isHeaderEvent(event)) return

			event.preventDefault()
			handleMove(event.touches[0].clientX, event.touches[0].clientY)
		}

		const onWindowResize = () => {
			const container = galleryRef.current
			if (!container) return

			const { offsetWidth: width, offsetHeight: height } = container
			camera.updateProjectionMatrix()
			renderer.setSize(width, height)
			renderer.setPixelRatio(window.devicePixelRatio)
			plane?.material.uniforms.uResolution.value.set(width, height)
		}

		const onMouseLeaveCanvas = () => {
			mousePosition.x = mousePosition.y = -1
			plane?.material.uniforms.uMousePos.value.set(-1, -1)
		}

		const onContextMenu = (event) => event.preventDefault()

		const setupEventListeners = () => {
			document.addEventListener('mousedown', onPointerDown)
			document.addEventListener('mousemove', onPointerMove)
			document.addEventListener('mouseup', onPointerUp)
			document.addEventListener('mouseleave', onPointerUp)

			const passiveOpts = { passive: false }
			document.addEventListener('touchstart', onTouchStart, passiveOpts)
			document.addEventListener('touchmove', onTouchMove, passiveOpts)
			document.addEventListener('touchend', onPointerUp, passiveOpts)

			window.addEventListener('resize', onWindowResize)
			document.addEventListener('contextmenu', onContextMenu)

			renderer.domElement.addEventListener('mousemove', updateMousePosition)
			renderer.domElement.addEventListener('mouseleave', onMouseLeaveCanvas)
		}

		const removeEventListeners = () => {
			document.removeEventListener('mousedown', onPointerDown)
			document.removeEventListener('mousemove', onPointerMove)
			document.removeEventListener('mouseup', onPointerUp)
			document.removeEventListener('mouseleave', onPointerUp)

			const passiveOpts = { passive: false }
			document.removeEventListener('touchstart', onTouchStart, passiveOpts)
			document.removeEventListener('touchmove', onTouchMove, passiveOpts)
			document.removeEventListener('touchend', onPointerUp, passiveOpts)

			window.removeEventListener('resize', onWindowResize)
			document.removeEventListener('contextmenu', onContextMenu)

			if (renderer?.domElement) {
				renderer.domElement.removeEventListener('mousemove', updateMousePosition)
				renderer.domElement.removeEventListener('mouseleave', onMouseLeaveCanvas)
			}
		}

		const animate = () => {
			animationId = window.requestAnimationFrame(animate)

			offset.x += (targetOffset.x - offset.x) * config.lerpFactor
			offset.y += (targetOffset.y - offset.y) * config.lerpFactor
			zoomLevel += (targetZoom - zoomLevel) * config.lerpFactor
			settleDragDeformation(dragDeformation, config.deformationLerpFactor)

			if (plane?.material.uniforms) {
				plane.material.uniforms.uOffset.value.set(offset.x, offset.y)
				plane.material.uniforms.uZoom.value = zoomLevel
				plane.material.uniforms.uDelta.value.set(
					dragDeformation.currentDelta.x,
					dragDeformation.currentDelta.y
				)
				plane.material.uniforms.uAmplitude.value =
					dragDeformation.currentAmplitude
			}

			renderer.render(scene, camera)
		}

		const init = async () => {
			const container = galleryRef.current
			if (!container) return

			scene = new THREE.Scene()
			camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
			camera.position.z = 1

			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
			renderer.setSize(container.offsetWidth, container.offsetHeight)
			renderer.setPixelRatio(window.devicePixelRatio)

			const bgColor = rgbaToArray(config.backgroundColor)
			renderer.setClearColor(
				new THREE.Color(bgColor[0], bgColor[1], bgColor[2]),
				bgColor[3]
			)
			container.appendChild(renderer.domElement)

			const imageTextures = await loadTextures(textTextures)
			if (!isMounted) return

			const imageAtlas = createTextureAtlas(imageTextures, false)
			const textAtlas = createTextureAtlas(textTextures, true)

			const uniforms = {
				uOffset: { value: new THREE.Vector2(0, 0) },
				uResolution: {
					value: new THREE.Vector2(container.offsetWidth, container.offsetHeight),
				},
				uBorderColor: {
					value: new THREE.Vector4(...rgbaToArray(config.borderColor)),
				},
				uHoverColor: {
					value: new THREE.Vector4(...rgbaToArray(config.hoverColor)),
				},
				uBackgroundColor: {
					value: new THREE.Vector4(...rgbaToArray(config.backgroundColor)),
				},
				uMousePos: { value: new THREE.Vector2(-1, -1) },
				uZoom: { value: 1.0 },
				uCellSize: { value: config.cellSize },
				uTextureCount: { value: projectsWithSlugs.length },
				uDelta: { value: new THREE.Vector2(0, 0) },
				uAmplitude: { value: 0 },
				uImageAtlas: { value: imageAtlas },
				uTextAtlas: { value: textAtlas },
			}

			const geometry = new THREE.PlaneGeometry(2, 2)
			const material = new THREE.ShaderMaterial({
				vertexShader: deformationVertexShader,
				fragmentShader: deformationFragmentShader,
				uniforms,
			})

			plane = new THREE.Mesh(geometry, material)
			scene.add(plane)

			setupEventListeners()
			animate()
		}

		init()

		return () => {
			isMounted = false
			document.body.classList.remove('dragging')
			removeEventListeners()
			if (animationId) window.cancelAnimationFrame(animationId)
			if (plane?.geometry) plane.geometry.dispose()
			if (plane?.material) plane.material.dispose()
			if (renderer) {
				renderer.dispose()
				if (renderer.domElement?.parentNode) {
					renderer.domElement.parentNode.removeChild(renderer.domElement)
				}
			}
		}
	}, [navigate])

	return (
		<section id="gallery" ref={galleryRef}>
			<div className="vignette-overlay" />
		</section>
	)
}

export default DraggableImagesDistortion
