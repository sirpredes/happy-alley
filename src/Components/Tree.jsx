import { useGLTF, useProgress } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

export default function Tree({position, scale}){

    const tree = useGLTF('/models/willow.glb')

    return <primitive object={tree.scene} scale={scale} position={position}/>
}

useGLTF.preload('/models/willow.glb')