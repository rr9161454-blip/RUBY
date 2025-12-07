import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AppMode, TreeItemData } from '../types';
import { ANIMATION_CONFIG } from '../constants';

interface FloatingInstanceProps {
  mode: AppMode;
  data: TreeItemData[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

export const FloatingInstance: React.FC<FloatingInstanceProps> = ({ mode, data, geometry, material }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObj = useMemo(() => new THREE.Object3D(), []);

  // Initialize positions to scatter or tree to start without jump
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    data.forEach((item, i) => {
      // Set Position/Rotation/Scale
      tempObj.position.copy(mode === AppMode.SCATTERED ? item.scatterPosition : item.treePosition);
      tempObj.rotation.copy(mode === AppMode.SCATTERED ? item.scatterRotation : item.treeRotation);
      tempObj.scale.setScalar(item.scale);
      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);

      // Set Color
      meshRef.current!.setColorAt(i, item.color);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Limit delta to avoid huge jumps on frame drops
    const d = Math.min(delta, 0.1);
    const speed = ANIMATION_CONFIG.speed * d;

    // We iterate manually to interp each matrix
    const currentMatrix = new THREE.Matrix4();
    const currentPos = new THREE.Vector3();
    const currentRot = new THREE.Quaternion();
    const currentScale = new THREE.Vector3();

    const targetPos = new THREE.Vector3();
    const targetRot = new THREE.Quaternion();
    const targetEuler = new THREE.Euler();

    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Read current instance
      meshRef.current.getMatrixAt(i, currentMatrix);
      currentMatrix.decompose(currentPos, currentRot, currentScale);

      // Determine Target
      if (mode === AppMode.TREE) {
        targetPos.copy(item.treePosition);
        targetEuler.copy(item.treeRotation);
      } else {
        // Add a slow float to the scatter position for "alive" feeling
        const time = state.clock.elapsedTime;
        targetPos.copy(item.scatterPosition);
        targetPos.y += Math.sin(time + item.id) * 0.05; // Gentle bobbing
        targetEuler.copy(item.scatterRotation);
        targetEuler.x += time * 0.1; // Gentle spin
      }
      targetRot.setFromEuler(targetEuler);

      // Interpolate
      currentPos.lerp(targetPos, speed);
      currentRot.slerp(targetRot, speed);
      
      // Recompose
      tempObj.position.copy(currentPos);
      tempObj.quaternion.copy(currentRot);
      tempObj.scale.copy(currentScale);
      tempObj.updateMatrix();

      meshRef.current.setMatrixAt(i, tempObj.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, data.length]}
      castShadow
      receiveShadow
    />
  );
};