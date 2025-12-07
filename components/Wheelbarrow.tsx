

import React from 'react';

interface WheelbarrowProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const Wheelbarrow: React.FC<WheelbarrowProps> = ({ position, rotation = [0, 0, 0], scale = 1.2 }) => {
  // Shared material for the body parts
  const greenMaterial = <meshStandardMaterial color="#006400" roughness={0.5} />;

  return (
    <group position={position} rotation={rotation} scale={scale}>
       {/* Wheel (Single, Front) - Moved to x=0.5 to embed */}
       {/* Rotated 90deg X so Axle is perpendicular to body length (Standard rolling) */}
       <mesh position={[0.5, 0.3, 0]} rotation={[Math.PI/2, 0, 0]}>
         <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
         <meshStandardMaterial color="#000000" roughness={0.9} />
       </mesh>
       {/* Axle - Aligned with wheel (Axis Z) */}
       <mesh position={[0.5, 0.3, 0]} rotation={[Math.PI/2, 0, 0]}>
         <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
         <meshStandardMaterial color="#333" />
       </mesh>

       {/* Hollow Body (Tray) - Constructed from 5 plates */}
       
       {/* Bottom Plate */}
       <mesh position={[0, 0.425, 0]}>
         <boxGeometry args={[1.2, 0.05, 0.8]} />
         {greenMaterial}
       </mesh>

       {/* Side Wall Left (Z+) */}
       <mesh position={[0, 0.625, 0.375]}>
         <boxGeometry args={[1.2, 0.35, 0.05]} />
         {greenMaterial}
       </mesh>

       {/* Side Wall Right (Z-) */}
       <mesh position={[0, 0.625, -0.375]}>
         <boxGeometry args={[1.2, 0.35, 0.05]} />
         {greenMaterial}
       </mesh>

       {/* Front Wall (X+) */}
       <mesh position={[0.575, 0.625, 0]}>
         <boxGeometry args={[0.05, 0.35, 0.7]} />
         {greenMaterial}
       </mesh>

       {/* Back Wall (X-) */}
       <mesh position={[-0.575, 0.625, 0]}>
         <boxGeometry args={[0.05, 0.35, 0.7]} />
         {greenMaterial}
       </mesh>

       {/* Frame/Handles - Black */}
       {/* Left Handle */}
       <mesh position={[-0.8, 0.6, 0.3]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#000" />
       </mesh>
       {/* Right Handle */}
       <mesh position={[-0.8, 0.6, -0.3]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
          <meshStandardMaterial color="#000" />
       </mesh>

       {/* Legs */}
       <mesh position={[-0.4, 0.2, 0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#000" />
       </mesh>
        <mesh position={[-0.4, 0.2, -0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshStandardMaterial color="#000" />
       </mesh>
    </group>
  );
};
