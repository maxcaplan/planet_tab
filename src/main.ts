import "normalize.css";
import "./style.css";

import { WebGL } from "./utils/WebGL";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Engine from "./engine/engine";
import Planet from "./engine/planet/planet";

let engine: Engine;

function main() {
  if (!WebGL.isWebGLAvailable()) {
    const warning = WebGL.getWebGLErrorMessage();
    const container = document.getElementById("container");

    if (container === null) {
      console.error(warning.innerHTML);
    } else {
      container.appendChild(warning);
    }

    return;
  }

  const camera_settings = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
  };

  const renderer_size = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  engine = new Engine(camera_settings, renderer_size);
  document.body.appendChild(engine.renderer.domElement);

  const planet = new Planet(10);
  planet.generate_geometry();
  planet.create_object();

  engine.addChild(planet);

  engine.scene.add(
    new OrbitControls(engine.camera, engine.renderer.domElement)
  );

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  if (engine) {
    engine.process();
  }
}

function on_window_resize() {
  if (engine) {
    engine.resize(window.innerWidth, window.innerHeight);
  }
}

window.onload = () => {
  main();
  window.onresize = on_window_resize;
};
