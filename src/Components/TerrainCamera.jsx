import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { fract, mix, dot, vec3, hash, noise, terrainHeight} from './AuxFunctions.js'

export default function TerrainPlayer({controlsEnabled = true, setIsMoving}) {
	const { camera } = useThree()

	const keys = useRef({})
	const velocity = useRef(new THREE.Vector3())

	const speed = 10
	const heightOffset = 2

	/**
	 * KEYBOARD INPUT
	 */
	useEffect(() => {

		if(!controlsEnabled) return

		const down = (e) => (keys.current[e.code] = true)
		const up = (e) => (keys.current[e.code] = false)

		window.addEventListener('keydown', down)
		window.addEventListener('keyup', up)

		return () => {
			window.removeEventListener('keydown', down)
			window.removeEventListener('keyup', up)
		}
	}, [controlsEnabled])

	/**
	 * APPLY MOVEMENT
	 */
	useFrame((state, delta) => {

		if(!controlsEnabled) return

		const dir = new THREE.Vector3()

		//Camera forward vector
		const forward = new THREE.Vector3()
		camera.getWorldDirection(forward)
		forward.y = 0
		forward.normalize()

		//Camera right vector
		const right = new THREE.Vector3()
		right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

		//Movement
		if (keys.current['KeyW']) dir.add(forward)
		if (keys.current['KeyS']) dir.sub(forward)
		if (keys.current['KeyA']) dir.sub(right)
		if (keys.current['KeyD']) dir.add(right)

		dir.normalize()

		//Step sound flag
		const moving =
		keys.current['KeyW'] ||
		keys.current['KeyA'] ||
		keys.current['KeyS'] ||
		keys.current['KeyD']

		setIsMoving(moving)

		camera.position.addScaledVector(dir, speed * delta)

		//Terrain follow
		const groundY = terrainHeight(camera.position.x, camera.position.z)
		camera.position.y = groundY + 10.5
	})

	return <>{controlsEnabled && <PointerLockControls />}</>
}
