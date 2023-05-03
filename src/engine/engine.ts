import * as THREE from "three";
import EngineObject from "./engine_object";

import Stats from "stats.js";

export default class Engine {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.Renderer;

  ambient_light: THREE.AmbientLight;
  directional_light: THREE.DirectionalLight;

  children: EngineObject[];

  stats: Stats | undefined;

  constructor(
    p_camera_settings: CameraSettings,
    p_renderer_size: RendererSize,
    p_renderer_settings?: THREE.WebGLRendererParameters
  ) {
    this.camera = new THREE.PerspectiveCamera(
      p_camera_settings.fov,
      p_camera_settings.aspect,
      p_camera_settings.near,
      p_camera_settings.far
    );

    this.camera.position.z = 5;

    this.scene = new THREE.Scene();

    this.ambient_light = new THREE.AmbientLight(0x808080);
    this.scene.add(this.ambient_light);

    this.directional_light = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directional_light.position.set(1, 1, 1);

    this.scene.add(this.directional_light);

    this.renderer = new THREE.WebGLRenderer(p_renderer_settings);
    this.renderer.setSize(p_renderer_size.width, p_renderer_size.height);

    this.children = [];

    if (import.meta.env.DEV) {
      this.stats = new Stats();
      this.stats.showPanel(0);
      document.body.appendChild(this.stats.dom);
    }
  }

  public process(): void {
    if (this.stats) this.stats.begin();

    this.children.forEach((child) => {
      child.process();
    });

    this.renderer.render(this.scene, this.camera);

    if (this.stats) this.stats.end();
  }

  public resize(p_width: number, p_height: number): void {
    this.camera.aspect = p_width / p_height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(p_width, p_height);
  }

  public addChild(child: EngineObject) {
    if (!child.object) {
      console.error(
        "Failed to add EngineObject as child; EngineObject.object === null"
      );
      return;
    }

    this.scene.add(child.object);
    this.children.push(child);
  }
}
