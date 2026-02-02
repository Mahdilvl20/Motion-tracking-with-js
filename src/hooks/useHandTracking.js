import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

export const useHandTracking = () => {
    const handRef = useRef({
        Right: { x: 0, y: 0, fingers: 0, detected: false, openness: 0 },
        Left: { x: 0, y: 0, fingers: 0, detected: false, openness: 0 },
    });

    useEffect(() => {
        let handLandmarker = null;
        let animationFrameId = null;
        let video = null;

        const setup = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2
            });

            video = document.createElement('video');
            video.id = "webcam-video";

            video.style.position = "fixed";
            video.style.top = "0";
            video.style.left = "0";
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.objectFit = "cover";
            video.style.transform = "scaleX(-1)";
            video.style.zIndex = "0";
            video.style.opacity = "1";

            document.body.appendChild(video);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" }
            });
            video.srcObject = stream;
            video.play();

            video.onloadeddata = () => predict();
        };

        const predict = () => {
            if (handLandmarker && video && video.readyState >= 2) {
                const results = handLandmarker.detectForVideo(video, performance.now());

                handRef.current.Right.detected = false;
                handRef.current.Left.detected = false;

                if (results.landmarks) {
                    for (const [index, landmarks] of results.landmarks.entries()) {
                        const classification = results.handedness[index][0];
                        const handName = classification.displayName;

                        const handData = handRef.current[handName];
                        if (handData) {
                            handData.detected = true;
                            handData.x = landmarks[8].x;
                            handData.y = landmarks[8].y;
                            handData.fingers = countFingers(landmarks, handName);
                            handData.openness = calculateHandOpenness(landmarks);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(predict);
        };

        setup();

        return () => {
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
            if(video) {
                if(video.srcObject) video.srcObject.getTracks().forEach(t=>t.stop());
                video.remove();
            }
            if(handLandmarker) handLandmarker.close();
        }
    }, []);

    return handRef;
};

function countFingers(landmarks, handName) {
    let count = 0;
    const fingerTips = [8, 12, 16, 20];
    const fingerPIPs = [6, 10, 14, 18];

    for (let i = 0; i < 4; i++) {
        if (landmarks[fingerTips[i]].y < landmarks[fingerPIPs[i]].y) count++;
    }
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    if (handName === "Right") {
        if (thumbTip.x < thumbIP.x) count++;
    } else {
        if (thumbTip.x > thumbIP.x) count++;
    }
    return count;
}

function calculateHandOpenness(landmarks) {
    const wrist = landmarks[0];
    const middleTip = landmarks[12];
    const dx = middleTip.x - wrist.x;
    const dy = middleTip.y - wrist.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    return Math.min(Math.max((distance - 0.1) / 0.3, 0), 1);
}