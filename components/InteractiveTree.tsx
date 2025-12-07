
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppMode } from '../types';
import { TREE_CONFIG } from '../constants';
import { generateTreeData } from './TreeLogic';
import { FloatingInstance } from './FloatingInstance';
import { TeddyBear, BrandedBall } from './TeddyBear';
import { Wheelbarrow } from './Wheelbarrow';
import { BufferGeometryUtils } from 'three/examples/jsm/Addons.js';

interface InteractiveTreeProps {
  mode: AppMode;
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ mode }) => {
  // 1. Data Generation (Memoized)
  const foliageData = useMemo(() => generateTreeData(TREE_CONFIG.foliageCount, 'foliage'), []);
  const bulbData = useMemo(() => generateTreeData(TREE_CONFIG.bulbCount, 'bulb'), []);
  const baubleData = useMemo(() => generateTreeData(TREE_CONFIG.baubleCount, 'bauble'), []);
  const diamondData = useMemo(() => generateTreeData(TREE_CONFIG.diamondCount, 'diamond'), []);
  const giftData = useMemo(() => generateTreeData(TREE_CONFIG.giftCount, 'gift'), []);
  const candyCaneData = useMemo(() => generateTreeData(TREE_CONFIG.candyCaneCount, 'candyCane'), []);

  // 2. Geometries & Materials

  // Foliage: Glowing Green Spheres
  const foliageGeo = useMemo(() => new THREE.SphereGeometry(0.08, 8, 8), []);
  const foliageMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', // Instance color drives the hue
    roughness: 0.2,
    metalness: 0.1,
    emissive: '#004400', // Base green glow - instance color will tint this effectively
    emissiveIntensity: 0.8,
  }), []);
  
  // Bulbs: Small glowing spheres
  const bulbGeo = useMemo(() => new THREE.SphereGeometry(0.15, 16, 16), []);
  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', 
    emissive: '#ffffff', 
    emissiveIntensity: 2.0, 
    roughness: 0.1,
    metalness: 0.5,
  }), []);

  // Baubles: Large metallic ornaments
  const baubleGeo = useMemo(() => new THREE.SphereGeometry(0.4, 32, 32), []);
  const baubleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.05, 
    metalness: 1.0, 
    envMapIntensity: 1.5,
  }), []);

  // Diamonds: Octahedrons
  const diamondGeo = useMemo(() => new THREE.OctahedronGeometry(0.35), []);
  const diamondMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0,
    metalness: 0.9,
    envMapIntensity: 2.0,
  }), []);

  // Gifts: Cubes
  const giftGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const giftMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', 
    roughness: 0.2, 
    metalness: 0.4, 
    envMapIntensity: 1.0,
    emissive: '#444444', 
    emissiveIntensity: 0.5,
  }), []);

  // Candy Canes
  const candyCaneGeo = useMemo(() => {
    // Construct a Hook Shape
    const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0, 1.0, 0),
        new THREE.Vector3(0.1, 1.3, 0),
        new THREE.Vector3(0.3, 1.35, 0),
        new THREE.Vector3(0.5, 1.1, 0)
    ]);
    
    // Extrude - Radius increased to 0.06
    const geo = new THREE.TubeGeometry(path, 20, 0.06, 8, false);
    
    // Center logic roughly so it rotates around middle
    geo.translate(-0.1, -0.6, 0); 
    return geo;
  }, []);

  const candyCaneMat = useMemo(() => {
    // Generate Red/Blue/Yellow Striped Texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Fill background white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 256, 256);

        // Draw diagonal stripes
        // Red, Blue, Yellow pattern
        const colors = ['#FF0000', '#0000FF', '#FFFF00'];
        const stripeWidth = 30;
        
        ctx.lineWidth = stripeWidth;
        
        let colorIdx = 0;
        for(let i = -256; i < 512; i += stripeWidth * 2) {
            ctx.strokeStyle = colors[colorIdx % 3];
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 256, 256);
            ctx.stroke();
            colorIdx++;
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);

    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.1,
        emissive: '#111111', 
    });
  }, []);

  // Ribbons & Bows Geometry (for Gifts)
  const ribbonGeo = useMemo(() => {
    const band1 = new THREE.BoxGeometry(1.02, 1.02, 0.2);
    const band2 = new THREE.BoxGeometry(0.2, 1.02, 1.02);
    
    const bowLoopLeft = new THREE.TorusGeometry(0.2, 0.05, 8, 20, Math.PI * 1.5);
    bowLoopLeft.rotateZ(Math.PI / 4);
    bowLoopLeft.translate(-0.15, 0.6, 0);

    const bowLoopRight = new THREE.TorusGeometry(0.2, 0.05, 8, 20, Math.PI * 1.5);
    bowLoopRight.rotateZ(-Math.PI / 4);
    bowLoopRight.rotateY(Math.PI);
    bowLoopRight.translate(0.15, 0.6, 0);

    const knot = new THREE.SphereGeometry(0.1, 8, 8);
    knot.translate(0, 0.55, 0);

    const geometries = [band1, band2, bowLoopLeft, bowLoopRight, knot];
    const merged = BufferGeometryUtils.mergeGeometries(geometries);
    return merged;
  }, []);

  const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFFFFF', // White base to support instance coloring
    roughness: 0.2,
    metalness: 0.6,
    envMapIntensity: 1.5,
  }), []);

  const ribbonData = useMemo(() => {
    // Red, Gold, Green - No Blue
    const ribbonColors = ['#FF0000', '#FFD700', '#008000']; 
    return giftData.map(d => ({
      ...d,
      color: new THREE.Color(ribbonColors[Math.floor(Math.random() * ribbonColors.length)]) 
    }));
  }, [giftData]);


  // 3. The Star
  const starGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.4;
    
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points + Math.PI / 2;
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2,
    });
    geo.center(); 
    return geo;
  }, []);

  const starRef = useRef<THREE.Group>(null);
  
  // 4. Spiral Red Ribbon (Flat & Wavy) 
  const { spiralRibbonGeo } = useMemo(() => {
      const pathPoints = [];
      const height = TREE_CONFIG.height; 
      // Adjusted Radius: Closer to the tree (Half the previous offset)
      const radiusBase = TREE_CONFIG.radius + 1.0; 
      const turns = 4;
      const segments = 400;
      
      // 1. Calculate Path
      for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          
          // Base Spiral
          const yBase = (t * height) - 2; 
          const rBase = radiusBase * (1 - t * 0.8); // Taper slightly
          const angle = t * turns * Math.PI * 2;

          // Add waviness for "floating ribbon" effect
          const yWobble = Math.sin(t * 50) * 0.05; 
          const rWobble = Math.cos(t * 30) * 0.1;
          
          const y = yBase + yWobble;
          const r = rBase + rWobble;

          pathPoints.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      
      const curve = new THREE.CatmullRomCurve3(pathPoints);

      // 2. Extrude Ribbon
      const shape = new THREE.Shape();
      // Reduced width from 0.2 to 0.05
      const width = 0.05; 
      const thickness = 0.02;
      
      shape.moveTo(-width/2, -thickness/2);
      shape.lineTo(width/2, -thickness/2);
      shape.lineTo(width/2, thickness/2);
      shape.lineTo(-width/2, thickness/2);
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, {
        steps: segments,
        extrudePath: curve,
        bevelEnabled: false,
      });

      return { spiralRibbonGeo: geo };
  }, []);

  const spiralRibbonGroupRef = useRef<THREE.Group>(null);
  const spiralRibbonMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    // Star Animation
    if (starRef.current) {
      const targetY = mode === AppMode.TREE ? TREE_CONFIG.height : 15;
      const targetScale = mode === AppMode.TREE ? 1 : 0.01;
      
      starRef.current.position.y = THREE.MathUtils.lerp(starRef.current.position.y, targetY, delta * 2);
      starRef.current.rotation.y += delta;
      starRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;

      const currentScale = starRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 2);
      starRef.current.scale.setScalar(nextScale);
    }

    // Spiral Ribbon Group Animation
    if (spiralRibbonGroupRef.current) {
        const targetScale = mode === AppMode.TREE ? 1 : 0;
        const currentScale = spiralRibbonGroupRef.current.scale.y; 
        
        // Faster shrink speed (8x) compared to grow speed (2x)
        const speed = targetScale === 0 ? delta * 8 : delta * 2;
        
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, speed);
        
        spiralRibbonGroupRef.current.scale.setScalar(nextScale);
        spiralRibbonGroupRef.current.visible = nextScale > 0.01;
        
        // Gentle floating rotation
        spiralRibbonGroupRef.current.rotation.y = -state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group>
      {/* Foliage (Body) - Glowing Spheres */}
      <FloatingInstance 
        mode={mode} 
        data={foliageData} 
        geometry={foliageGeo} 
        material={foliageMat} 
      />

      {/* Bulbs (Lights) */}
      <FloatingInstance 
        mode={mode} 
        data={bulbData} 
        geometry={bulbGeo} 
        material={bulbMat} 
      />

      {/* Baubles */}
      <FloatingInstance 
        mode={mode} 
        data={baubleData} 
        geometry={baubleGeo} 
        material={baubleMat} 
      />

      {/* Diamonds */}
      <FloatingInstance 
        mode={mode} 
        data={diamondData} 
        geometry={diamondGeo} 
        material={diamondMat} 
      />

      {/* Gifts Layer 1 */}
      <FloatingInstance 
        mode={mode} 
        data={giftData} 
        geometry={giftGeo} 
        material={giftMat} 
      />
      
      {/* Gifts Layer 2: Colored Ribbons */}
      <FloatingInstance 
        mode={mode} 
        data={ribbonData} 
        geometry={ribbonGeo} 
        material={ribbonMat} 
      />

      {/* Rainbow Candy Canes */}
      <FloatingInstance 
        mode={mode} 
        data={candyCaneData} 
        geometry={candyCaneGeo} 
        material={candyCaneMat} 
      />

      {/* The Spiral Red Ribbon Group */}
      <group ref={spiralRibbonGroupRef}>
        <mesh geometry={spiralRibbonGeo}>
            <meshStandardMaterial 
                ref={spiralRibbonMatRef}
                color="#DC143C" 
                emissive="#000000" 
                emissiveIntensity={0} 
                roughness={0.4} 
                metalness={0.1} 
                side={THREE.DoubleSide}
            />
        </mesh>
      </group>

      {/* Star */}
      <group ref={starRef} position={[0, TREE_CONFIG.height, 0]}>
        <mesh geometry={starGeo}>
          <meshStandardMaterial 
            color="#FFFFA0" 
            emissive="#FFD700" 
            emissiveIntensity={3} 
            roughness={0}
            metalness={1}
            toneMapped={false} 
          />
        </mesh>
        <pointLight intensity={3} distance={15} color="#FFD700" />
      </group>

      {/* Teddy Bear - Positioned OUTSIDE the tree */}
      <group visible={mode === AppMode.TREE}>
        <TeddyBear position={[6, -2.5, 3]} rotation={[0, -0.8, 0]} />
        {/* Wheelbarrow - Behind the bear */}
        {/* Bear is at [6, -2.5, 3] rotating ~-45deg. Behind it is roughly further out diagonally. */}
        <Wheelbarrow position={[7.5, -2.5, 1.5]} rotation={[0, -0.8, 0]} scale={2.0} />
      </group>
    </group>
  );
};
