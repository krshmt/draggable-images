const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const createDragDeformationState = () => ({
	currentDelta: { x: 0, y: 0 },
	targetDelta: { x: 0, y: 0 },
	currentAmplitude: 0,
	targetAmplitude: 0,
	lastMoveTime: 0,
})

export const resetDragDeformation = (state) => {
	state.targetDelta.x = 0
	state.targetDelta.y = 0
	state.targetAmplitude = 0
	state.lastMoveTime = performance.now()
}

export const updateDragDeformationTarget = (state, deltaX, deltaY) => {
	const now = performance.now()
	const elapsed = Math.max(now - state.lastMoveTime, 16)
	const velocityX = deltaX / elapsed
	const velocityY = deltaY / elapsed
	const speed = Math.hypot(velocityX, velocityY)
	const length = Math.hypot(deltaX, deltaY) || 1

	state.lastMoveTime = now
	state.targetDelta.x = clamp(deltaX / length, -1, 1)
	state.targetDelta.y = clamp(-deltaY / length, -1, 1)
	state.targetAmplitude = clamp(speed * 1.8, 0, 0.055) //Dernière valeur pour changer la sensibilité de la déformation
}

export const settleDragDeformation = (state, lerpFactor = 0.12) => {
	state.currentDelta.x += (state.targetDelta.x - state.currentDelta.x) * lerpFactor
	state.currentDelta.y += (state.targetDelta.y - state.currentDelta.y) * lerpFactor
	state.currentAmplitude +=
		(state.targetAmplitude - state.currentAmplitude) * lerpFactor

	state.targetDelta.x *= 0.9
	state.targetDelta.y *= 0.9
	state.targetAmplitude *= 0.88
}
