import {useMemo,useRef} from 'react';
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";

const Particles = () => {
    const count=2500;

    const positions=useMemo(()=>{
        const array=new Float32Array(count*3);
        for (let i=0;i<count;i++){
            const i3=i*3;
            array[i3]=(Math.random()-0.5)*10;
            array[i3+1]=(Math.random()-0.5)*10;
            array[i3+2]=0;
        }
        return array;
    },[]);

    const pointsRef=useRef(null);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position"
                 count={count}
                 array={positions}
                 itemSize={3}/>
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#00ffff"
                sizeAttentions={true}
                transparent={true}
                opacity={0.8}
            />
        </points>
    )
}
export default Particles;