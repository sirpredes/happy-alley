import { Sky, Cloud } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import DesktopControls from './DesktopControls'
import Tree from './Tree'
import Grass from './Grass'
import MobileControls from './MobileControls'

export default function Experience({controlsEnabled, setIsMoving, isMobile}){

    return <>

        {/* <Perf /> */}

        {isMobile ? 
            <MobileControls 
                controlsEnabled={controlsEnabled} 
                setIsMoving={setIsMoving}
            /> 
                : 
            <DesktopControls 
                controlsEnabled={controlsEnabled} 
                setIsMoving={setIsMoving}
            />
        }

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