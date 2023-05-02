import * as THREE from "three";

export default class EngineObject {
  object: THREE.Object3D | undefined;

  constructor(p_object?: THREE.Object3D) {
    if (p_object) this.object = p_object;
  }

  process(): void {
    return;
  }
}
