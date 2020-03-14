import io from 'socket.io-client';
import * as THREE from 'three';
import { BufferGeometry, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene, WebGLRenderer, DirectionalLight } from 'three';
import { StlFileLoader } from './util/stl-file-loader';

const OrbitControls = require('three-orbit-controls')(THREE);

const socket = io('http://localhost:3333');

socket.on('ready', () => {
  console.log('Server online');
});

socket.on('file-updated', () => refreshItem());

let playground: Playground;

function refreshItem() {
  if (!playground) {
    return;
  }

  console.log('File Updated!');

  playground.load();
}

class Playground {
  private loader = new StlFileLoader();
  private scene: Scene = new Scene();
  private camera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 4000);
  private renderer: WebGLRenderer = new WebGLRenderer();
  private light: DirectionalLight = new DirectionalLight(0xffffff);
  private light2: DirectionalLight = new DirectionalLight(0xdddddd);
  private light3: DirectionalLight = new DirectionalLight(0xc1c1c1);
  private material: MeshPhongMaterial = new MeshPhongMaterial({
    color: 0xccaa00,
    specular: 0x004444,
    shininess: 3,
  });
  private geometry: BufferGeometry;
  private mesh: Mesh;
  private controls: any;

  constructor(private url: string) {
    this.loader.setResponseType('arraybuffer');

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xcccccc, 1);
    this.renderer.shadowMap.enabled = true;

    document.body.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(0, 20, 200);
    this.controls.update();

    this.light.position.set(-1, -1, 1).normalize();
    this.scene.add(this.light);
    this.light2.position.set(1, 1, 1).normalize();
    this.scene.add(this.light2);
    this.light3.position.set(1, -1, -1).normalize();
    this.scene.add(this.light3);

    this.animate();
  }

  async load() {
    this.geometry = await this.loader.loadAndParse(this.url);
    this.geometry.center();

    if (this.mesh) {
      console.log('mesh remove');
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(mat => mat.dispose());
      } else {
        this.mesh.material.dispose();
      }
    }

    console.log('scene add');
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    console.log('render');
  }
}

playground = new Playground(window.location.hash.replace('#', ''));

playground.load();
