export function fract(x){
  	return x - Math.floor(x)
}

export function mix(a, b, t){
  	return a * (1 - t) + b * t
}

export function dot(a, b){
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function vec3(x, y, z){
  return { x, y, z }
}

//Hash function
export function hash(p){
  const x = dot(p, vec3(127.1, 311.7, 74.7))
  const y = dot(p, vec3(269.5, 183.3, 246.1))
  const z = dot(p, vec3(113.5, 271.9, 124.6))

  return vec3(
    -1 + 2 * fract(Math.sin(x) * 43758.5453123),
    -1 + 2 * fract(Math.sin(y) * 43758.5453123),
    -1 + 2 * fract(Math.sin(z) * 43758.5453123)
  )
}

//3D noise
export function noise(p){
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

export function terrainHeight(x, z){
	const h = noise(vec3(x * 0.02, 0, z * 0.02)) * 9.19
	return h
}