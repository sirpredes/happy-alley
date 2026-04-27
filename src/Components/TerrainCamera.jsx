import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { createNoise3D } from 'simplex-noise'
import * as THREE from 'three'
import generateHeightmap from './GenerateHeightMap'

export default function TerrainPlayer() {
  const { camera } = useThree()

  const keys = useRef({})
  const velocity = useRef(new THREE.Vector3())

  const speed = 20
  const heightOffset = 2

  // 🎮 keyboard input
  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true)
    const up = (e) => (keys.current[e.code] = false)

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((state, delta) => {
    const dir = new THREE.Vector3()

    // 🔥 camera forward vector
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    // 🔥 camera right vector
    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    // movement
    if (keys.current['KeyW']) dir.add(forward)
    if (keys.current['KeyS']) dir.sub(forward)
    if (keys.current['KeyA']) dir.sub(right)
    if (keys.current['KeyD']) dir.add(right)

    dir.normalize()

    camera.position.addScaledVector(dir, speed * delta)

    // 🌿 terrain follow
    const groundY = terrainHeight(camera.position.x, camera.position.z)//getTerrainHeight(
    //   camera.position.x,
    //   camera.position.z
    // )

    camera.position.y = groundY + 10.5//sampleHeight(generateHeightmap(), camera.position.x, camera.position.z, 512) + 2//THREE.MathUtils.lerp(
    //   camera.position.y,
    //   groundY + heightOffset,
    //   0.15
    // )
  })

  return <PointerLockControls />
}

const noise3D = createNoise3D()

// function getTerrainHeight(x, z) {
//   const scale = 0.02
//   const height = noise3D(x * scale, 0, z * scale) * 10
//   return height
// }

// function sampleHeight(texture, x, z, size) {
//   const data = texture.image.data

//   const u = ((x * 0.001) % 1 + 1) % 1
//   const v = ((z * 0.001) % 1 + 1) % 1

//   const ix = Math.floor(u * size)
//   const iz = Math.floor(v * size)

//   return data[ix + iz * size]
// }

// helpers GLSL → JS
function fract(x) {
  return x - Math.floor(x)
}

function mix(a, b, t) {
  return a * (1 - t) + b * t
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function vec3(x, y, z) {
  return { x, y, z }
}

// 🔥 hash EXACTO portado
function hash(p) {
  const x = dot(p, vec3(127.1, 311.7, 74.7))
  const y = dot(p, vec3(269.5, 183.3, 246.1))
  const z = dot(p, vec3(113.5, 271.9, 124.6))

  return vec3(
    -1 + 2 * fract(Math.sin(x) * 43758.5453123),
    -1 + 2 * fract(Math.sin(y) * 43758.5453123),
    -1 + 2 * fract(Math.sin(z) * 43758.5453123)
  )
}

// 🔥 noise 3D EXACTO
function noise(p) {
  const i = vec3(
    Math.floor(p.x),
    Math.floor(p.y),
    Math.floor(p.z)
  )

  const f = vec3(
    fract(p.x),
    fract(p.y),
    fract(p.z)
  )

  const u = vec3(
    f.x * f.x * (3 - 2 * f.x),
    f.y * f.y * (3 - 2 * f.y),
    f.z * f.z * (3 - 2 * f.z)
  )

  function grad(ix, iy, iz) {
    const h = hash(vec3(i.x + ix, i.y + iy, i.z + iz))
    const d = vec3(f.x - ix, f.y - iy, f.z - iz)
    return dot(h, d)
  }

  return mix(
    mix(
      mix(grad(0,0,0), grad(1,0,0), u.x),
      mix(grad(0,1,0), grad(1,1,0), u.x),
      u.y
    ),
    mix(
      mix(grad(0,0,1), grad(1,0,1), u.x),
      mix(grad(0,1,1), grad(1,1,1), u.x),
      u.y
    ),
    u.z
  )
}

// 🎯 terrain height EXACTO
export function terrainHeight(x, z) {
  const h = noise(vec3(x * 0.02, 0, z * 0.02)) * 9.19
  return h
}