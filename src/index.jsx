import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
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
        <Experience />
    </Canvas>
)