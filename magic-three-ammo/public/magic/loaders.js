
import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class MagicLoader {

  mixer;

  loadedMeshs = [];

  constructor(scene) {
    this.scene = scene;
  }

  async fbx(p) {
    return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(p, (object) => {
      this.mixer = new THREE.AnimationMixer(object);
      this.action = this.mixer.clipAction(object.animations[0]);
      this.action.play();
      object.traverse(function(child) {
        if(child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      object.name = 'zombie';
      object.scale.setScalar(0.045);
      this.scene.add(object);
      this.loadedMeshs.push(object);
    });
  })
  }

}