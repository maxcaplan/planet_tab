import * as THREE from "three";
import EngineObject from "../engine_object";
import PlanetFace from "./planet_face";

export default class Planet extends EngineObject {
  resolution: number;
  geometry: THREE.BufferGeometry | undefined;
  material: THREE.Material;
  faces: PlanetFace[] = [];

  static DIRECTIONS: THREE.Vector3[] = [
    new THREE.Vector3(0, 1, 0), // UP
    new THREE.Vector3(0, -1, 0), // DOWN
    new THREE.Vector3(1, 0, 0), // RIGHT
    new THREE.Vector3(-1, 0, 0), // LEFT
    new THREE.Vector3(0, 0, 1), // FRONT
    new THREE.Vector3(0, 0, -1), // BACK
  ];

  constructor(p_resolution: number, p_material?: THREE.Material) {
    super();

    this.resolution = p_resolution;

    this.material =
      p_material ||
      new THREE.MeshStandardMaterial({
        color: 0xcc5555,
        wireframe: false,
      });

    this.create_faces();
  }

  public process(): void {
    if (this.object) {
      // this.object.rotation.x = Math.PI / 6;
      this.object.rotation.y += 0.001;
    }
  }

  public create_faces() {
    Planet.DIRECTIONS.forEach((direction) => {
      this.faces.push(new PlanetFace(this.resolution, direction));
    });
  }

  public create_object() {
    if (!this.geometry) {
      this.generate_geometry();
    }

    this.object = new THREE.Mesh(this.geometry, this.material);
  }

  public generate_geometry() {
    let vertices: number[] = [];
    let indices: number[] = [];
    let normals: number[] = [];

    console.log(this.faces.length);

    this.faces.forEach((face) => {
      const face_vertex_data = face.generate_indexed_verticies(
        vertices.length / 3
      );

      vertices.push(...face_vertex_data.vertices);
      indices.push(...face_vertex_data.indices);
      normals.push(...face_vertex_data.normals);
    });

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setIndex(indices);
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    this.geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );
  }
}
