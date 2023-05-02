import * as THREE from "three";
import EngineObject from "../engine_object";

export default class PlanetFace extends EngineObject {
  geometry: THREE.BufferGeometry | undefined;
  resolution = 1;
  local_up = new THREE.Vector3(0, 1, 0);

  // Local axis relative to the local_up axis
  axisA: THREE.Vector3 = new THREE.Vector3();
  axisB: THREE.Vector3 = new THREE.Vector3();

  constructor(p_resolution?: number, p_local_up?: THREE.Vector3) {
    super();

    if (p_resolution) this.resolution = p_resolution;
    if (p_local_up) this.local_up = p_local_up;

    this.update_local_axes();
  }

  public generate_indexed_verticies(index_offset = 0): {
    vertices: number[];
    indices: number[];
    normals: number[];
  } {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    // Generate geometry verticies
    for (let y = 0; y <= this.resolution; y++) {
      const y_percent = y / this.resolution;

      for (let x = 0; x <= this.resolution; x++) {
        const x_percent = x / this.resolution;

        const point_on_axis_a = new THREE.Vector3()
          .copy(this.axisA)
          .multiplyScalar((x_percent - 0.5) * 2);

        const point_on_axis_b = new THREE.Vector3()
          .copy(this.axisB)
          .multiplyScalar((y_percent - 0.5) * 2);

        const point_on_unit_cube = new THREE.Vector3();
        point_on_unit_cube.addVectors(this.local_up, point_on_axis_a);
        point_on_unit_cube.add(point_on_axis_b);

        const {
          x: x_cord,
          y: y_cord,
          z: z_cord,
        } = this.point_to_unit_sphere(point_on_unit_cube);

        vertices.push(x_cord, y_cord, z_cord);
      }
    }

    // Generate geometry indicies and normals
    for (let y = 0; y < this.resolution; y++) {
      for (let x = 0; x < this.resolution; x++) {
        const a = x + y * (this.resolution + 1) + index_offset;
        const b = x + 1 + y * (this.resolution + 1) + index_offset;
        const c = x + (y + 1) * (this.resolution + 1) + index_offset;
        const d = x + 1 + (y + 1) * (this.resolution + 1) + index_offset;

        // generate two faces (triangles) per iteration
        indices.push(a, b, c); // face one
        indices.push(c, b, d); // face two

        // generate face normals
        const vert_a = new THREE.Vector3(...vertices.slice(a, a + 4));
        const vert_b = new THREE.Vector3(...vertices.slice(b, b + 4));
        const vert_c = new THREE.Vector3(...vertices.slice(c, c + 4));
        const vert_d = new THREE.Vector3(...vertices.slice(d, d + 4));

        const edge_a = new THREE.Vector3().subVectors(vert_a, vert_b);
        const edge_b = new THREE.Vector3().subVectors(vert_b, vert_c);
        const edge_c = new THREE.Vector3().subVectors(vert_c, vert_d);
        const edge_d = new THREE.Vector3().subVectors(vert_d, vert_a);

        const face_a_normal = new THREE.Vector3()
          .crossVectors(edge_a, edge_b)
          .normalize();
        const face_b_normal = new THREE.Vector3()
          .crossVectors(edge_d, edge_c)
          .normalize();

        const { x: aX, y: aY, z: aZ } = face_a_normal;
        const { x: bX, y: bY, z: bZ } = face_b_normal;

        normals.push(aX, aY, aZ);
        normals.push(bX, bY, bZ);
      }
    }

    return { vertices, indices, normals };
  }

  public create_geometry(): void {
    let { vertices, indices } = this.generate_indexed_verticies();

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setIndex(indices);
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
  }

  public create_object(): void {
    if (this.geometry) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        wireframe: true,
      });
      this.object = new THREE.Mesh(this.geometry, material);
    }
  }

  public update_local_axes(): void {
    this.axisA.x = this.local_up.y;
    this.axisA.y = this.local_up.z;
    this.axisA.z = this.local_up.x;

    this.axisB.crossVectors(this.local_up, this.axisA);
  }

  private point_to_unit_sphere(point: THREE.Vector3): THREE.Vector3 {
    const x2 = Math.pow(point.x, 2);
    const y2 = Math.pow(point.y, 2);
    const z2 = Math.pow(point.z, 2);

    const sphere_point = new THREE.Vector3();
    sphere_point.x = point.x * Math.sqrt(1 - y2 / 2 - z2 / 2 + (y2 * z2) / 3);
    sphere_point.y = point.y * Math.sqrt(1 - x2 / 2 - z2 / 2 + (x2 * z2) / 3);
    sphere_point.z = point.z * Math.sqrt(1 - x2 / 2 - y2 / 2 + (x2 * y2) / 3);

    return sphere_point;
  }
}
