import { OrbitControls, Sky, GizmoHelper, TransformControls, Cloud } from '@react-three/drei'
import { useControls } from 'leva'
import { ReactThreeFiber, useThree } from '@react-three/fiber'
// import { EffectComposer, ToneMapping, Bloom} from '@react-three/postprocessing'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'
import TerrainCamera from './TerrainCamera'
import Tree from './Tree'
import Grass from './Grass'


export default function Experience()
{

    const isMobile = window.matchMedia("(pointer: coarse)").matches

    // const { gl } = useThree()
    // console.log(gl)

    // const sun = useMemo(() => new THREE.Vector3(), [])

    // const { turbidity, rayleigh, mieCoefficient, mieDirectionalG, elevation, azimuth, exposure } = useControls('Sky', {
    //     turbidity: { value: 0.6, min: 0, max: 20 },
    //     rayleigh: { value: 2.5, min: 0, max: 4, step: 0.001 },
    //     mieCoefficient: { value: 0.09, min: 0, max: 0.1, step: 0.001 },
    //     mieDirectionalG: { value: 0.41, min: 0, max: 1, step: 0.001 },
    //     elevation: { value: 2, min: 0, max: 90, step: 0.1 },
    //     azimuth: { value: 180, min: -180, max: 180, step: 0.1 },
    //     // exposure: { value: 0.5, min: 0, max: 1 }
    // })
//     useEffect(() => {
//   const phi = THREE.MathUtils.degToRad(90 - elevation)
//   const theta = THREE.MathUtils.degToRad(azimuth)

//   sun.setFromSphericalCoords(10, phi + 10, theta + 10)
//   console.log(sun)
// }, [azimuth, elevation, sun])

//     useEffect(() => {
//         gl.toneMappingExposure = exposure
//     }, [exposure])

    return <>

        <Perf />

        {isMobile ? <OrbitControls makeDefault /> : <TerrainCamera />}

        <ambientLight intensity={2.5} />
        
        <Grass position={[0, 15, 0]}/>

        <Tree position={[5.12, -2, 138]} scale={7}/>

        {/* <Cloud /> */}
        
        <Sky 
            turbidity={0.6}
            rayleigh={2.5}
            mieCoefficient={0.09}
            mieDirectionalG={0.41}
            sunPosition={[10, 0.5, 100]}
            distance={10000}
        />
    </>
}