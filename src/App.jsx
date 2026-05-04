import { Suspense, useState, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from './Components/Experience.jsx'
import { LoadingScreen } from './Components/LoadingScreen.jsx'
import MobileSettingsButton from './Components/MobileSettingsButton.jsx'
import SettingsMenu from './Components/SettingsMenu.jsx'
import AudioManager from './Components/AudioManager.jsx'

export default function App(){

    const isMobile = window.matchMedia("(pointer: coarse)").matches
    
    const [start, setStart] = useState(false)


    /**
     * Settings
     */
    const [settingsOpen, setSettingsOpen] = useState(false)

    const defaultSettings = {
        masterVolume: 100,
        ambientVolume: 100,
        smoothEdges: false
    }

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem("settings")
        return saved ? JSON.parse(saved) : defaultSettings
    })


    /**
     * Audio triggers
     */
    const [isMoving, setIsMoving] = useState(false)
    const [buttonPressed, setButtonPressed] = useState(false)


    /**
     * Canvas
     */
    const canvas = useMemo(() => {
        return (
            <Canvas
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 150,
                    position: [0, 5, -6]
                }}
                gl={{
                    antialias: settings.smoothEdges
                }}
            >
                <Suspense fallback={null}>
                    <Experience controlsEnabled={!settingsOpen} setIsMoving={setIsMoving} isMobile={isMobile}/>
                </Suspense>
            </Canvas>
        )
    }, [settings.smoothEdges, settingsOpen])

    /**
     * Pointer Lock handler
     */
    useEffect(() => {

        if(isMobile) return

        const handlePointerLockChange = () => {

            const isLocked = document.pointerLockElement

            // si se desbloquea → abrir menú
            if (!isLocked) {
                setSettingsOpen(true)
            }
        }

        document.addEventListener(
            'pointerlockchange',
            handlePointerLockChange
        )

        return () => {
            document.removeEventListener(
                'pointerlockchange',
                handlePointerLockChange
            )
        }
    }, [])
    
    return <>

        {canvas}

        <LoadingScreen 
            started={start} 
            onStarted={() => setStart(true)}
        />

        {isMobile && 
            <MobileSettingsButton 
                onClick={() => setSettingsOpen(true)}
            /> 
        }

        {settingsOpen && 
            <SettingsMenu 
                settings={settings} 
                setSettings={setSettings} 
                buttonPressed={buttonPressed} 
                setButtonPressed={setButtonPressed} 
                onClose={() => setSettingsOpen(false)} 
            />
        }

        <AudioManager 
            start={start} 
            settings={settings} 
            isMoving={isMoving} 
            buttonPressed={buttonPressed} 
            settingsOpen={settingsOpen}
        />

        {isMobile && <div id="nipple-zone" class="nipple-zone"></div>}

    </>
}