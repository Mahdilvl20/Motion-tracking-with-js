import {useEffect, useMemo, useRef, useState} from 'react';
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {sampleText} from "../utils/textSampler.js";
import {lerp} from "../utils/math.js";
const Particles = () => {
    const {viewport} =useThree();
    const count=5000;
    const [particlesData,setParticlesData] = useState(null);
    /*const [positions,targets]=useMemo(()=>{
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
    },[]);*/
    const pointsRef=useRef(null);

    useEffect(() => {
        const textPoints=sampleText("MisRay",800,600,150);
        const count=textPoints.length;
        const posArray=new Float32Array(count*3);
        const targetArray=new Float32Array(count*3);
        for (let i=0;i<count;i++){
            const i3=i*3;
            const p=textPoints[i];

                posArray[i3]=(Math.random()-0.5)*10;
                posArray[i3+1]=(Math.random()-0.5)*10;
                posArray[i3+2]=0;

                targetArray[i3]=p.x;
                targetArray[i3+1]=p.y;
                targetArray[i3+2]=0;
        }
        setParticlesData({position:posArray,targets:targetArray,count:count});
    },[])

    useFrame((state)=>{
        if (!particlesData || !pointsRef.current) return;
        const mouseX=(state.pointer.x * viewport.width)/2;
        const mouseY=(state.pointer.y * viewport.height)/2;
        const currentPositions=pointsRef.current.geometry.attributes.position.array;
        for (let i =0;i<count;i++){
            const i3=i*3;
            const px=currentPositions[i3];
            const py=currentPositions[i3+1];
            const tx=particlesData.targets[i3];
            const ty=particlesData.targets[i3+1];

            const dx=mouseX-px;
            const dy=mouseY-py;
            const dist =Math.sqrt(dx*dx+dy*dy);

            let targetX=tx;
            let targetY=ty;
            const radius=1.5;
            //const maxDistance=3;
            const maxDistance=Math.atan2(dx,dy);
            if (dist < radius){
                const angle=Math.atan2(dy,dx);
               // const force=(radius-dist)/radius;
                const force = Math.pow((radius - dist) / radius, 3);
                const forceX=Math.cos(angle)*force*maxDistance;
                const forceY=Math.sin(angle)*force*maxDistance;
                targetX-=forceX;
                targetY-=forceY;
            }
            currentPositions[i3]=lerp(currentPositions[i3],targetX,0.1);
            currentPositions[i3+1]=lerp(currentPositions[i3+1],targetY,0.1);
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    })
    if (!particlesData) return null;
    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position"
                 count={particlesData.count}
                 array={particlesData.position}
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