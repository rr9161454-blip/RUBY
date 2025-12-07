import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { InteractiveTree } from './InteractiveTree';
import { Snowfall } from './Snowfall';
import { AppMode } from '../types';
import * as THREE from 'three';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface ExperienceProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  onStatusChange: (status: 'loading' | 'active' | 'error') => void;
}

const SceneContent: React.FC<ExperienceProps & { handRotation: number, isHandDetected: boolean }> = ({ mode, handRotation, isHandDetected }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Rotation Logic
  useFrame((state, delta) => {
    if (groupRef.current) {
        if (isHandDetected) {
            // Smoothly lerp to hand rotation
            // handRotation is 0 to 1, map to -PI to PI
            const targetRot = (handRotation - 0.5) * Math.PI * 2;
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -targetRot, delta * 5);
        } else {
            // Auto rotate
            groupRef.current.rotation.y += delta * 0.05;
        }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={50} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        enabled={!isHandDetected} // Disable mouse orbit if hand is controlling
        autoRotate={false} 
      />

      {/* Environment for Metallic Reflections */}
      <Environment preset="sunset" background={false} />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.5} color="#002200" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={8} 
        color="#fff" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={3} color="#FFD700" />
      <pointLight position={[0, -5, 5]} intensity={2} color="#FF4500" />

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Snowfall Effect */}
      <Snowfall />

      {/* Main Content */}
      <group ref={groupRef} position={[0, -4, 0]}>
        <InteractiveTree mode={mode} />
        {/* Floor Reflection fake */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -2.5, 0]}>
            <circleGeometry args={[15, 64]} />
            <meshStandardMaterial 
                color="#001100" 
                roughness={0} 
                metalness={0.9} 
                opacity={0.5}
                transparent
            />
        </mesh>
      </group>

      {/* Post Processing for Luxury Glow */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.6} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
      </EffectComposer>
    </>
  );
};

export const Experience: React.FC<ExperienceProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [handRotation, setHandRotation] = useState(0.5);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const { onStatusChange, setMode } = props;
  
  // Hand Tracking Logic
  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            startCamera();
        } catch (error) {
            console.error("Error initializing MediaPipe:", error);
            onStatusChange('error');
        }
    };

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener('loadeddata', predictWebcam);
                    onStatusChange('active');
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                onStatusChange('error');
            }
        } else {
            console.error("getUserMedia not supported");
            onStatusChange('error');
        }
    };

    let lastVideoTime = -1;
    const predictWebcam = async () => {
        if (videoRef.current && handLandmarker) {
            const startTimeMs = performance.now();
            if (videoRef.current.currentTime !== lastVideoTime) {
                lastVideoTime = videoRef.current.currentTime;
                const result = handLandmarker.detectForVideo(videoRef.current, startTimeMs);

                if (result.landmarks && result.landmarks.length > 0) {
                    setIsHandDetected(true);
                    const landmarks = result.landmarks[0];
                    
                    // 1. Hand Rotation Control (X Position)
                    // landmarks[0] is wrist. 0 is left, 1 is right (mirrored usually)
                    const wristX = landmarks[0].x; 
                    setHandRotation(wristX); 

                    // 2. Gesture Control (Open vs Fist)
                    // Simple heuristic: Distance of finger tips (8, 12, 16, 20) to wrist (0)
                    // vs Distance of finger PIP joints (6, 10, 14, 18) to wrist
                    const tips = [8, 12, 16, 20];
                    const pips = [6, 10, 14, 18];
                    
                    let extendedFingers = 0;
                    // Check thumb separately (landmark 4 vs 3 or 2) - skipping thumb for simplicity usually works with 4 fingers
                    
                    for (let i = 0; i < 4; i++) {
                        const tip = landmarks[tips[i]];
                        const pip = landmarks[pips[i]];
                        const wrist = landmarks[0];

                        const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
                        const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
                        
                        if (distTip > distPip) {
                            extendedFingers++;
                        }
                    }

                    // Open Palm: >= 3 fingers extended -> SCATTER (Fasan)
                    // Fist: < 2 fingers extended -> GATHER (Julong / Tree)
                    if (extendedFingers >= 3) {
                        setMode(AppMode.SCATTERED);
                    } else if (extendedFingers <= 1) {
                        setMode(AppMode.TREE);
                    }
                } else {
                    setIsHandDetected(false);
                }
            }
            animationFrameId = requestAnimationFrame(predictWebcam);
        }
    };

    setupMediaPipe();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        cancelAnimationFrame(animationFrameId);
        if (handLandmarker) handLandmarker.close();
    };
  }, [onStatusChange, setMode]);

  return (
    <div className="w-full h-screen bg-black">
      {/* Hidden Video Element for MediaPipe */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden absolute top-0 left-0 w-32 h-24 opacity-0 pointer-events-none" />
      
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 2.5 }}
      >
        <color attach="background" args={['#020502']} />
        <SceneContent 
            {...props} 
            handRotation={handRotation} 
            isHandDetected={isHandDetected} 
        />
      </Canvas>
    </div>
  );
};
