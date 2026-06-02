import { useMemo, useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import nipplejs from 'nipplejs'
import { fract, mix, dot, vec3, hash, noise, terrainHeight} from './AuxFunctions.js'

export default function MobileControls({controlsEnabled = true, setIsMoving}){
    const { camera } = useThree()

    const moveRef = useRef({ x: 0, y: 0 })
    const managerRef = useRef(null)

    const yawRef = useRef(Math.PI)
    const pitchRef = useRef(0)

    const touchRef = useRef({
        active: false,
        touchId: null,
        lastX: 0,
        lastY: 0,
    })
    
    const needsSyncRef = useRef(true)

    const speed = 8 
    const sensitivity = 0.003
    const maxPitch = Math.PI / 2.4
    const heightOffset = 10.5

	/**
	 * JOYSTICK
	 */
    useEffect(() => {

        if(!controlsEnabled) return

        if(managerRef.current) return

        const nippleZone = document.getElementById('nipple-zone')
        console.log(nippleZone)

        if(!nippleZone) return

		//Create joystick & appearance
        const manager = nipplejs.create({
            zone: nippleZone,
            mode: 'static',

            position: {
                left: '50%',
                top: '50%',
            },
            restOpacity: 0.25,
            multitouch: false,
            dynamicPage: false,
            color: {
                front: 'linear-gradient(135deg, #818cf8, #38f88e)',
                back: 'rgba(99, 102, 241, 0.12)'
            }
        })
        managerRef.current = manager

		//Player Controls
        manager.on('move', (event) => {
            if (!event.data.vector) return

            const {vector} = event.data

            moveRef.current.x = vector.x
            moveRef.current.y = vector.y
            console.log(moveRef.current)
        })

        manager.on('end', () => {
            moveRef.current.x = 0
            moveRef.current.y = 0
            console.log(moveRef.current)
        })

        return () => {
            if (managerRef.current) {
                managerRef.current.destroy()
                managerRef.current = null
            }
        }
    }, [controlsEnabled])

	/**
	 * CAMERA CONTROLS
	 */
    useEffect(() => {
        if (!controlsEnabled) return

        camera.rotation.order = 'YXZ'

        needsSyncRef.current = true

        // Reset touch state
        touchRef.current.active = false
        touchRef.current.touchId = null

        //Identify the touch
        const onTouchStart = (e) => {
            for (const touch of e.touches) {
                // ignora sa zona des joystick
                if (touch.clientX < window.innerWidth * 0.4) continue

                if (touchRef.current.active) return

                touchRef.current.active = true
                touchRef.current.touchId = touch.identifier
                touchRef.current.lastX = touch.clientX
                touchRef.current.lastY = touch.clientY

                break
            }
        }

        //Finger movement --> camera rotation
        const onTouchMove = (e) => {
            if (!touchRef.current.active) return

            const touch = [...e.touches].find(
                t => t.identifier === touchRef.current.touchId
            )

            if (!touch) return
            
            //Only if it is needed (Camera bug after closing settings)
            if (needsSyncRef.current) {
                yawRef.current = camera.rotation.y
                pitchRef.current = camera.rotation.x

                pitchRef.current = Math.max(
                    -maxPitch,
                    Math.min(maxPitch, pitchRef.current)
                )

                needsSyncRef.current = false
                return
            }

            const deltaX = touch.clientX - touchRef.current.lastX
            const deltaY = touch.clientY - touchRef.current.lastY

            yawRef.current -= deltaX * sensitivity
            pitchRef.current -= deltaY * sensitivity

            pitchRef.current = Math.max(
                -maxPitch,
                Math.min(maxPitch, pitchRef.current)
            )

            touchRef.current.lastX = touch.clientX
            touchRef.current.lastY = touch.clientY
        }

        //Clean touch ref
        const onTouchEnd = (e) => {
            const stillExists = [...e.touches].some(
                t => t.identifier === touchRef.current.touchId
            )

            if (!stillExists) {
                touchRef.current.active = false
                touchRef.current.touchId = null
            }
        }

        window.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchmove', onTouchMove, { passive: true })
        window.addEventListener('touchend', onTouchEnd)

        return () => {
            window.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }

    }, [controlsEnabled, camera])

	/**
	 * APPLAY PLAYER MOVEMENT
	 */
    useFrame((_, delta) => {
        if (!controlsEnabled) return

        const moveX = moveRef.current.x
        const moveY = moveRef.current.y

        setIsMoving(moveX !== 0 || moveY !== 0)

        // Apply camera look
        camera.rotation.set(
            pitchRef.current,
            yawRef.current,
            0,
            'YXZ'
        )

        // Forward vector
        const forward = new THREE.Vector3()
        camera.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()

        // Right vector
        const right = new THREE.Vector3()
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

        // Final movement direction
        const dir = new THREE.Vector3()
        dir.addScaledVector(forward, moveY)
        	.addScaledVector(right, moveX)

        if (dir.lengthSq() > 0) {
			dir.normalize()
			camera.position.addScaledVector(dir, speed * delta)
        }

        // Terrain follow
        const groundY = terrainHeight(
			camera.position.x,
			camera.position.z
        )

        camera.position.y = groundY + heightOffset
    })

    return null
}