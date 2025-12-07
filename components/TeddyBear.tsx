

import React from 'react';
import { Text, RenderTexture, PerspectiveCamera } from '@react-three/drei';

interface BrandedBallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  text: string;
}

export const BrandedBall: React.FC<BrandedBallProps> = ({ position, rotation = [0, 0, 0], color, text }) => {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.35, 64, 64]} />
        <meshStandardMaterial roughness={0.2} metalness={0.3} color="white">
             {/* Use RenderTexture to map the text onto the sphere for perfect curvature */}
             <RenderTexture attach="map" anisotropy={16}>
                {/* 
                    Camera at z=3 looking at (0,0,0) where Text is.
                */}
                <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 3]} />
                {/* Background color of the ball */}
                <color attach="background" args={[color]} />
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Text 
                    fontSize={0.25} 
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight="bold"
                    letterSpacing={-0.05}
                >
                  {text}
                </Text>
             </RenderTexture>
        </meshStandardMaterial>
      </mesh>
    </group>
  );
};

export const TeddyBear: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
  // Darker Khaki / Antique Bronze for a more classic teddy look
  const furColor = "#8B7355"; 
  const snoutColor = "#DEB887"; // BurlyWood

  // Rotated -90 degrees (-PI/2) to ensure texture (Text) faces the front relative to the bear
  const ballRot: [number, number, number] = [0, -Math.PI / 2, 0];
  
  // Increased emissive intensity for glowing effect
  const glowIntensity = 0.6; 

  return (
    <group position={position} rotation={rotation} scale={1.5}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>

      {/* Snout */}
      <mesh position={[0, 1.1, 0.35]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
            color={snoutColor} 
            roughness={0.6} 
            emissive={snoutColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.15, 0.48]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      
      {/* Eyes - Moved slightly forward and increased size for visibility */}
      <mesh position={[-0.14, 1.2, 0.42]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>
      <mesh position={[0.14, 1.2, 0.42]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.35, 1.45, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>
      <mesh position={[0.35, 1.45, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>

      {/* Santa Hat (Folded Style) */}
      <group position={[0, 1.55, 0]} rotation={[0, 0, -0.2]}> {/* Raised Y to 1.55 to sit ON TOP of head/ears */}
        {/* White Brim REMOVED */}
        
        {/* Lower Hat Part (Tapered Cylinder) */}
        <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.18, 0.32, 0.5, 32]} />
            <meshStandardMaterial color="#FF0000" roughness={0.3} />
        </mesh>

        {/* Joint Sphere - Connects the lower and upper parts seamlessly */}
        <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.17, 32, 32]} />
            <meshStandardMaterial color="#FF0000" roughness={0.3} />
        </mesh>
        
        {/* Upper Hat Part (Folded Cone) */}
        {/* Pivot at the top of the lower part (0.5) */}
        <group position={[0, 0.5, 0]} rotation={[0, 0, 1.5]}>  {/* Reduced angle to 1.5 rads (~85 deg) */}
            <mesh position={[0, 0.25, 0]}>
                <coneGeometry args={[0.17, 0.5, 32]} />
                <meshStandardMaterial color="#FF0000" roughness={0.3} />
            </mesh>
            
            {/* White Pom-Pom */}
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#FFFFFF" roughness={1} />
            </mesh>
        </group>
      </group>

      {/* Arms */}
      <mesh position={[-0.5, 0.8, 0.2]} rotation={[0.5, 0, -0.5]}>
        <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>
      <mesh position={[0.5, 0.8, 0.2]} rotation={[0.5, 0, 0.5]}>
        <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, 0.2, 0.4]} rotation={[1.2, -0.2, 0]}>
        <capsuleGeometry args={[0.18, 0.5, 4, 8]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>
      <mesh position={[0.3, 0.2, 0.4]} rotation={[1.2, 0.2, 0]}>
        <capsuleGeometry args={[0.18, 0.5, 4, 8]} />
        <meshStandardMaterial 
            color={furColor} 
            roughness={0.9} 
            emissive={furColor} 
            emissiveIntensity={glowIntensity} 
        />
      </mesh>

      {/* Red Bow Tie */}
      <mesh position={[0, 0.95, 0.35]} rotation={[Math.PI/2, 0, 0]}>
         <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
         <meshStandardMaterial color="#FF0000" roughness={0.4} />
      </mesh>
      <mesh position={[-0.1, 0.95, 0.35]} rotation={[0, 0, 0.2]}>
         <sphereGeometry args={[0.08, 16, 16]} />
         <meshStandardMaterial color="#FF0000" roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 0.95, 0.35]} rotation={[0, 0, -0.2]}>
         <sphereGeometry args={[0.08, 16, 16]} />
         <meshStandardMaterial color="#FF0000" roughness={0.4} />
      </mesh>

      {/* Branded Balls surrounding the bear */}
      {/* 1. Red - GOOD ONE - Outer Left */}
      <BrandedBall position={[-0.8, 0.35, 0.8]} rotation={ballRot} color="#FF0000" text="GOOD ONE" />
      
      {/* 2. Blue - AILYONS - Outer Right */}
      <BrandedBall position={[0.8, 0.35, 0.8]} rotation={ballRot} color="#00BFFF" text="AILYONS" />
      
      {/* 3. Green - NICE ONE - In front of left foot */}
      <BrandedBall position={[-0.3, 0.35, 1.0]} rotation={ballRot} color="#32CD32" text="NICE ONE" />
      
      {/* 4. Blue Elephant - KISSKIDS - In front of right foot */}
      <BrandedBall position={[0.3, 0.35, 1.0]} rotation={ballRot} color="#4169E1" text="KISSKIDS" />

    </group>
  );
};
