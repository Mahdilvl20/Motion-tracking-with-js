import {useEffect, useRef} from "react";
import {FilesetResolver, HandLandmarker} from "@mediapipe/tasks-vision";


export const useHandTracking=()=>{
    const handRef=useRef({
        Right:{x:0,y:0,fingers:0,detected:false},
        Left:{x:0,y:0,openness:0,detected:false},
    });
    useEffect(()=>{
        let handLandmarker;
        let animationFrameId;
        let video;

        const setup = async () => {
            console.log(" شروع دانلود مدل MediaPipe...");

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

            console.log("✅ مدل لود شد! حالا دوربین...");

            video = document.createElement('video');


            video.style.position = "fixed";
            video.style.top = "0";
            video.style.left = "0";
            video.style.width = "320px";
            video.style.zIndex = "9999";
            video.style.transform = "scaleX(-1)";
            document.body.appendChild(video);
            // ---------------------------------------------

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            video.srcObject = stream;
            video.play();

            video.onloadeddata = () => {
                console.log("📷 دوربین روشن شد و دیتا دارد");
                predict();
            };
        };
        const predict = () => {
            if (handLandmarker && video.currentTime > 0) {
                const results = handLandmarker.detectForVideo(video, performance.now());

                // ریست کردن
                handRef.current.Right.detected = false;
                handRef.current.Left.detected = false;

                if (results.landmarks && results.landmarks.length > 0) {

                    console.log("دست‌های پیدا شده:", results.handedness);
                    // -----------------------------------

                    for (const [index, landmarks] of results.landmarks.entries()) {
                        const classification = results.handedness[index][0];
                        const handName = classification.displayName;

                        console.log(`دست ${handName} تشخیص داده شد`);

                        const handData = handRef.current[handName];
                        if (handData) {
                            handData.detected = true;
                            if (handName === "Right") {
                                handData.fingers = countFingers(landmarks, "Right");
                            }
                            handData.openness = calculateHandOpenness(landmarks);
                            console.log(`${handName} -> Fingers: ${handData.fingers}, Open: ${handData.openness}`);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(predict);
        };
        setup();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if(video && video.srcObject){
                video.srcObject.getTracks().forEach(t=>t.stop());
            }
            if(handLandmarker) handLandmarker.close();
        }
    },[])
    return handRef;
};

function countFingers(landmarks, handName){
    let count=0;
    const fingerTips = [8, 12, 16, 20];
    const fingerPIPs = [6, 10, 14, 18];
    for (let i = 0; i < 4; i++) {
        if (landmarks[fingerTips[i]].y < landmarks[fingerPIPs[i]].y) {
            count++;
        }
    }
    const thumbTip=landmarks[4];
    const thumbIP=landmarks[3];
    if (handName === "Right") {
        if (thumbTip.x < thumbIP.x) count++;
    } else {
        if (thumbTip.x > thumbIP.x) count++;
    }

    return count;
}
function calculateHandOpenness(landmarks){
    const wrist = landmarks[0];
    const middleTip = landmarks[12];

    const dx = middleTip.x - wrist.x;
    const dy = middleTip.y - wrist.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    console.log("Raw Distance:", distance.toFixed(2));

    const minOpen = 0.18;
    const maxOpen = 0.40;

    let openness = (distance - minOpen) / (maxOpen - minOpen);

    return Math.min(Math.max(openness, 0), 1);
}