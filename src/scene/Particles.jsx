import {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {sampleText} from "../utils/textSampler.js";
import {lerp} from "../utils/math.js";
const Particles = () => {
    const {viewport} =useThree();
    const count=5000;

    const [positions,targets]=useMemo(()=>{
        const posArray=new Float32Array(count*3);
        const targetArray=new Float32Array(count*3);
        for (let i=0;i<count;i++){
            const i3=i*3;
            posArray[i3]=(Math.random()-0.5)*10;
            posArray[i3+1]=(Math.random()-0.5)*10;
            posArray[i3+2]=0;

            targetArray[i3]=0;
            targetArray[i3+1]=0;
            targetArray[i3+2]=0;
        }
        return [posArray,targetArray];
    },[]);

    const pointsRef=useRef(null);

    useEffect(() => {
        const textPoints=sampleText("MisRay",800,600,150);

        for (let i=0;i<count;i++){
            const i3=i*3;

            if(i<textPoints.length){
                const p=textPoints[i];
                targets[i3]=p.x;
                targets[i3+1]=p.y;
                targets[i3+2]=0;
            }else {
                targets[i3]=(Math.random()-0.5)*50;
                targets[i3+1]=(Math.random()-0.5)*50;
            }
        }
    },[])

    useFrame(()=>{
        const currentPositions=pointsRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count;i++){
            const i3=i*3;

            currentPositions[i3]=lerp(currentPositions[i3],targets[i3],0.1);
            currentPositions[i3+1]=lerp(currentPositions[i3+1],targets[i3+1],0.1);
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });
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
                sizeAttenuation={true}
                transparent={true}
                opacity={0.8}
            />
        </points>
    )
}
export default Particles;