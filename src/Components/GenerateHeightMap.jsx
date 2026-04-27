import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'

const noise = createNoise2D()

export default function generateHeightmap(size, scale = 0.02) {
  const data = new Float32Array(size * size)

  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const nx = x * scale
      const nz = z * scale

      const height = noise(nx, nz) * 10

      data[x + z * size] = height
    }
  }

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RedFormat,
    THREE.FloatType
  )

  texture.needsUpdate = true
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return texture
}