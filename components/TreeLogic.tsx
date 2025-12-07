

import * as THREE from 'three';
import { TreeItemData } from '../types';
import { TREE_CONFIG } from '../constants';

// Helper to generate random position on a sphere surface (or volume)
const getRandomSpherePos = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Volume distribution
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

const getRandomColor = (palette: string[]): THREE.Color => {
  return new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
};

// Fibonacci spiral algorithm for cone distribution
export const generateTreeData = (count: number, type: 'bulb' | 'bauble' | 'diamond' | 'gift' | 'foliage' | 'candyCane'): TreeItemData[] => {
  const data: TreeItemData[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    // TREE POSITION (Cone)
    const y = (i / count) * TREE_CONFIG.height; // Height from 0 to max
    const radiusAtHeight = TREE_CONFIG.radius * (1 - y / TREE_CONFIG.height); 
    
    // Add some randomness to radius for natural look
    let effectiveRadius = radiusAtHeight;
    let effectiveY = y;

    if (type === 'gift') {
      // Gifts: Half in, half out
      effectiveRadius = radiusAtHeight;
      // Add slight randomness so they aren't perfectly aligned
      effectiveRadius += (Math.random() - 0.5) * 0.2; 
    } else if (type === 'foliage') {
        // Foliage fills the volume more densely
        effectiveRadius += (Math.random() - 0.2) * 0.5;
    } else if (type === 'candyCane') {
        // Hang on the surface
        effectiveRadius = radiusAtHeight + 0.3;
    } else {
      // Bulbs/Baubles/Diamonds sit slightly outside the foliage
      effectiveRadius += 0.2 + (Math.random() * 0.3);
    }

    // Only foliage needs to be pushed away from center to avoid hole
    if (type === 'foliage') {
        // Simple clamp to ensure volume
        effectiveRadius = Math.max(0.2, effectiveRadius);
    }

    const theta = phi * i; 
    const treeX = Math.cos(theta) * effectiveRadius;
    const treeZ = Math.sin(theta) * effectiveRadius;

    const treePos = new THREE.Vector3(treeX, effectiveY - 2, treeZ);

    // Look at center for rotation
    const treeRot = new THREE.Euler(0, -theta, 0);
    
    // Customize rotation per type
    if (type === 'foliage') {
        treeRot.x = -Math.PI / 2 + (Math.random() * 0.5); 
        treeRot.y = -theta + (Math.random() - 0.5); 
        treeRot.z = (Math.random() - 0.5) * 0.5;
    } else if (type === 'gift') {
        treeRot.x = Math.random() * Math.PI * 2;
        treeRot.y = Math.random() * Math.PI * 2;
        treeRot.z = Math.random() * Math.PI * 2;
    } else if (type === 'candyCane') {
        // Hang vertically, slightly tilted
        treeRot.x = (Math.random() - 0.5) * 0.5;
        treeRot.y = -theta + Math.PI / 2; // Face outward
        treeRot.z = (Math.random() - 0.5) * 0.5;
    } else {
        treeRot.x = Math.random() * Math.PI;
        treeRot.z = Math.random() * Math.PI;
    }

    // SCATTER POSITION
    const scatterPos = getRandomSpherePos(TREE_CONFIG.scatterRadius);
    const scatterRot = new Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    // SCALE
    let scale = 1;
    if (type === 'bulb') scale = Math.random() * 0.3 + 0.2; 
    if (type === 'bauble') scale = Math.random() * 0.4 + 0.3; 
    if (type === 'diamond') scale = Math.random() * 0.3 + 0.2;
    if (type === 'gift') scale = Math.random() * 0.8 + 0.5; // Smallest is 0.5
    if (type === 'foliage') scale = Math.random() * 0.5 + 0.5;
    // Candy Cane: Increased scale to 1.0 (Doubled from 0.5)
    if (type === 'candyCane') scale = 1.0;

    // COLOR
    let color = new THREE.Color('#ffffff');
    if (type === 'bulb') color = getRandomColor(TREE_CONFIG.bulbColors);
    if (type === 'bauble') color = getRandomColor(TREE_CONFIG.baubleColors);
    if (type === 'diamond') color = getRandomColor(TREE_CONFIG.diamondColors);
    if (type === 'gift') color = getRandomColor(TREE_CONFIG.giftColors);
    if (type === 'foliage') color = getRandomColor(TREE_CONFIG.foliageColors);
    // Candy Canes will rely on texture, but we set a base color
    if (type === 'candyCane') color = new THREE.Color('#FFFFFF');

    data.push({
      id: i,
      scatterPosition: scatterPos,
      scatterRotation: scatterRot,
      treePosition: treePos,
      treeRotation: treeRot,
      scale,
      color,
    });
  }

  // POST-PROCESSING: Foliage Colors
  if (type === 'foliage') {
    const indices = Array.from({ length: count }, (_, k) => k);
    for (let k = indices.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [indices[k], indices[j]] = [indices[j], indices[k]];
    }
    for (let k = 0; k < 200 && k < count; k++) {
        data[indices[k]].color.setHex(0xFFFFFF); // White
    }
    for (let k = 200; k < 500 && k < count; k++) {
        data[indices[k]].color.setHex(0xFFD700); // Gold
    }
  }

  // POST-PROCESSING: Gift Colors (Swap Purple to Red/Gold)
  if (type === 'gift') {
    // Define purple-ish hues to target
    const purpleHues = ['#8A2BE2', '#9400D3', '#800080', '#9370DB', '#800080']; 
    // We can check hex strings by converting back, or just check distances.
    // Simpler: iterate and if it matches known purple list, swap.
    // Since we assigned from TREE_CONFIG.giftColors, we can check against that list.
    
    let swapToRed = true; // Toggle to split 50/50

    data.forEach(item => {
        const itemHexString = '#' + item.color.getHexString().toUpperCase();
        // Check if this hex is one of the purples in our palette
        // Or closely matches a purple
        if (['#8A2BE2', '#800080', '#9400D3', '#FF00FF', '#8B008B'].includes(itemHexString) || (item.color.r > 0.4 && item.color.b > 0.4 && item.color.g < 0.2)) {
             if (swapToRed) {
                 item.color.set('#FF0000'); // Red
             } else {
                 item.color.set('#FFD700'); // Gold
             }
             swapToRed = !swapToRed;
        }
    });

    // Force the topmost gift (last one in array since sorted by height i) to be Pink
    if (data.length > 0) {
        data[data.length - 1].color.set('#FF69B4'); // Hot Pink
    }
  }

  return data;
};
// Add missing import for Euler if it wasn't auto-imported, though in previous content it was used via THREE.Euler
// Re-adding the THREE import fully just in case:
import { Euler } from 'three';
