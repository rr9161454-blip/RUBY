
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Snowfall: React.FC = () => {
  const count = 2000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 40 + 10;
      const z = (Math.random() - 0.5) * 50;
      const speed = 0.05 + Math.random() * 0.1;
      const wobble = Math.random() * Math.PI * 2;
      temp.push({ x, y, z, originalY: y, speed, wobble });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((p, i) => {
      // Move down
      p.y -= p.speed;
      // Wobble
      const wobbleX = Math.sin(state.clock.elapsedTime + p.wobble) * 0.05;
      
      // Reset if too low
      if (p.y < -5) {
        p.y = 25;
      }

      dummy.position.set(p.x + wobbleX, p.y, p.z);
      dummy.scale.setScalar(0.05 + Math.random() * 0.02); // Flicker size slightly
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} />
    </instancedMesh>
  );
};
