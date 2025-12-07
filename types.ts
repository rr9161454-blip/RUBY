import * as THREE from 'three';

export enum AppMode {
  SCATTERED = 'SCATTERED',
  TREE = 'TREE',
}

export interface TreeItemData {
  id: number;
  scatterPosition: THREE.Vector3;
  scatterRotation: THREE.Euler;
  treePosition: THREE.Vector3;
  treeRotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
}