import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './Components/Experience.jsx'
import { LoadingScreen } from './Components/LoadingScreen.jsx'

export default function App(){
    
    const [start, setStart] = useState(false)
    
    return <>
        <Canvas
            camera={ {
                fov: 45,
                near: 0.1,
                far: 150,
                position: [  0, 5, -6 ]
            } }
            gl={{
                antialias:false
            }}
        >
            <Suspense fallback={null}>
                <Experience />
            </Suspense>
        </Canvas>
        <LoadingScreen started={start} onStarted={() => setStart(true)}/>
    </>
}