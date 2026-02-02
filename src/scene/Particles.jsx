import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useHandTracking } from '../hooks/useHandTracking';
import { lerp } from '../utils/math';

const WORDS = { 1: "WELCOME", 2: "TO", 3: "MisRay", 4: "Project", 5: ":>>" };

const Particles = () => {
    const { viewport } = useThree();
    const handRef = useHandTracking();

    const [currentWord, setCurrentWord] = useState("WELCOME");
    const [particlesData, setParticlesData] = useState(null);

    const pointsRef = useRef();

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = 600;
        const h = 200;
        canvas.width = w;
        canvas.height = h;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(currentWord, w / 2, h / 2);

        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const points = [];

        for (let y = 0; y < h; y += 3) {
            for (let x = 0; x < w; x += 3) {
                const index = (y * w + x) * 4;
                if (data[index] > 128) {
                    points.push({ x: (x / w) - 0.5, y: (y / h) - 0.5 });
                }
            }
        }

        if (points.length === 0) {
            for(let i=0; i<500; i++) points.push({x: (Math.random()-0.5)*0.5, y: (Math.random()-0.5)*0.5});
        }

        const count = points.length;
        const posArray = new Float32Array(count * 3);
        const targetArray = new Float32Array(count * 3);
        const colorsArray = new Float32Array(count * 3);
        const randomsArray = new Float32Array(count * 3);

        const textScale = viewport.width * 0.8;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            posArray[i3] = (Math.random() - 0.5) * viewport.width;
            posArray[i3 + 1] = (Math.random() - 0.5) * viewport.height;
            posArray[i3 + 2] = 0;

            targetArray[i3] = points[i].x * textScale;
            targetArray[i3 + 1] = -points[i].y * (textScale * 0.5);
            targetArray[i3 + 2] = 0;

            colorsArray[i3] = Math.random();
            colorsArray[i3 + 1] = Math.random();
            colorsArray[i3 + 2] = 1.0;

            const theta = Math.random() * 2 * Math.PI;
            const r = Math.sqrt(Math.random());

            randomsArray[i3] = r * Math.cos(theta);
            randomsArray[i3+1] = r * Math.sin(theta);
            randomsArray[i3+2] = 0;
        }

        setParticlesData({
            count,
            positions: posArray,
            targets: targetArray,
            colors: colorsArray,
            randoms: randomsArray
        });
    }, [currentWord, viewport]);

    useFrame(() => {
        if (!particlesData || !pointsRef.current) return;

        const left = handRef.current.Left;
        const right = handRef.current.Right;

        const isAnyHandDetected = left.detected || right.detected;
        pointsRef.current.material.opacity = lerp(pointsRef.current.material.opacity, isAnyHandDetected ? 1 : 0, 0.1);

        let isChaosMode = false;

        if (left.detected) {
            if (left.openness > 0.2) isChaosMode = true;
        }

        let isRightRepelling = false;
        let repelX = 0;
        let repelY = 0;

        if (right.detected) {
            const x = -(right.x - 0.5) * viewport.width;
            const y = (0.5 - right.y) * viewport.height;

            isRightRepelling = true;
            repelX = x;
            repelY = y;

            if (right.fingers >= 1 && right.fingers <= 5) {
                const newWord = WORDS[right.fingers];
                if (newWord && newWord !== currentWord) setCurrentWord(newWord);
            }
        }

        const { count, targets, randoms } = particlesData;
        const currentPositions = pointsRef.current.geometry.attributes.position.array;

        const maxX = (viewport.width / 2) - 0.5;
        const maxY = (viewport.height / 2) - 0.5;
        const scatterScale = Math.max(viewport.width, viewport.height) * 1.5;

        const radius = 50;
        const maxRepulsion = 20;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            let targetX = targets[i3];
            let targetY = targets[i3 + 1];

            if (isChaosMode) {
                targetX += randoms[i3] * scatterScale;
                targetY += randoms[i3+1] * scatterScale;
                targetX = Math.max(-maxX, Math.min(maxX, targetX));
                targetY = Math.max(-maxY, Math.min(maxY, targetY));
            }

            if (isRightRepelling) {
                const px = currentPositions[i3];
                const py = currentPositions[i3 + 1];

                const dx = repelX - px;
                const dy = repelY - py;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = Math.pow((radius - dist) / radius, 3);

                    targetX -= Math.cos(angle) * force * maxRepulsion;
                    targetY -= Math.sin(angle) * force * maxRepulsion;
                }
            }

            currentPositions[i3] = lerp(currentPositions[i3], targetX, 0.1);
            currentPositions[i3 + 1] = lerp(currentPositions[i3 + 1], targetY, 0.1);
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!particlesData) return null;

    return (
        <points ref={pointsRef}>
            <bufferGeometry key={particlesData.count}>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesData.count}
                    array={particlesData.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particlesData.count}
                    array={particlesData.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.8}
                vertexColors={true}
                color="#ffffff"
                transparent={true}
                opacity={0}
                sizeAttenuation={true}
            />
        </points>
    );
};

export default Particles;