import io from 'socket.io-client';
import * as THREE from 'three';
import {
  AxesHelper,
  BufferGeometry,
  DirectionalLight,
  DirectionalLightHelper,
  GridHelper,
  Light,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  MeshPhongMaterial,
  AmbientLight,
} from 'three';
import { StlFileLoader } from './util/stl-file-loader';

const OrbitControls = require('three-orbit-controls')(THREE);

const urlHash = window.location.hash.replace(/^#/, '');

const spinnerElem: HTMLDivElement = document.querySelector('#spinner-wrapper');
const refreshBtn: HTMLButtonElement = document.querySelector('#refresh-button');

const socket = io('http://localhost:3333');

socket.on('connect', () => {
  console.log('Server online');

  socket.emit('join-room', urlHash);
});

socket.on('file-update-end', () => refreshItem());
socket.on('file-update-start', () => startSpinner());

refreshBtn.addEventListener('click', () => {
  console.log('Manual refresh triggered');
  socket.emit('client-triggered-reload');
});

async function refreshItem() {
  if (!playground) {
    return;
  }

  console.log('File Updated!');

  await playground.load();
  stopSpinner();
}

function startSpinner() {
  spinnerElem.style.opacity = '1';
  refreshBtn.style.display = 'none';
}

function stopSpinner() {
  spinnerElem.style.opacity = '0';
  refreshBtn.style.display = 'block';
}

let playground: Playground;

class Playground {
  private loader = new StlFileLoader();
  private scene: Scene = new Scene();
  private camera: PerspectiveCamera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 4000);
  private renderer: WebGLRenderer = new WebGLRenderer();
  private lights: Light[] = [];
  // private material: MeshNormalMaterial = new MeshNormalMaterial({ flatShading: true });
  private material: MeshPhongMaterial = new MeshPhongMaterial({
    color: 0x0000aa,
    specular: 0x004444,
    shininess: 0.2,
  });
  private geometry: BufferGeometry;
  private mesh: Mesh;
  private axesHelper = new AxesHelper(Math.max(this.maxX, this.maxY));
  private grids: [GridHelper, GridHelper];
  private controls: any;

  constructor(private url: string, private maxX: number, private maxY: number) {
    this.setupScene();

    // the material we're currently using does not need light
    this.addLighting();

    this.makeGrid();

    this.setupCamera();

    window.addEventListener('resize', () => this.onWindowResize(), false);

    this.animate();
  }

  async load() {
    this.geometry = await this.loader.loadAndParse(this.url);
    this.geometry.computeBoundingBox();
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

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;

    const xLength = this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x;
    const yLength = this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y;
    const zLength = this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z;

    this.mesh.translateX(this.maxX / 2);
    this.mesh.translateY(this.maxY / 2);
    this.mesh.translateZ(zLength / 2);
    this.scene.add(this.mesh);
  }

  private setupScene() {
    this.loader.setResponseType('arraybuffer');

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xcccccc, 1);
    this.renderer.shadowMap.enabled = true;

    document.body.appendChild(this.renderer.domElement);
  }

  private makeGrid() {
    const x = this.maxX;
    const y = this.maxY;

    const longerAxis = Math.max(x, y);
    const shorterAxis = Math.min(x, y);

    const longerAxisGrid: GridHelper = new GridHelper(shorterAxis, shorterAxis / 10, 0x3f3f3f, 0x3f3f3f);
    const shorterAxisGrid: GridHelper = new GridHelper(shorterAxis, shorterAxis / 10, 0x3f3f3f, 0x3f3f3f);

    longerAxisGrid.translateX(shorterAxis / 2);
    longerAxisGrid.translateY(shorterAxis / 2);

    let extraX = 0;
    let extraY = 0;

    if (x > y) {
      extraX = longerAxis - shorterAxis;
    } else {
      extraY = longerAxis - shorterAxis;
    }

    shorterAxisGrid.translateX(shorterAxis / 2 + extraX);
    shorterAxisGrid.translateY(shorterAxis / 2 + extraY);

    longerAxisGrid.rotation.x = Math.PI / 2;
    shorterAxisGrid.rotation.x = Math.PI / 2;

    this.scene.add(longerAxisGrid);
    this.scene.add(shorterAxisGrid);

    this.grids = [longerAxisGrid, shorterAxisGrid];

    // adding Axes as well
    this.axesHelper.translateX(-0.2);
    this.axesHelper.translateY(-0.2);
    this.scene.add(this.axesHelper);
  }

  private addLighting() {
    const light: Light = new THREE.PointLight(0xffffff, 7);
    this.camera.add(light);
    this.lights.push(light);

    const ambientLight = new AmbientLight(0x404040, 2); // soft white light

    this.scene.add(ambientLight);

    this.lights.push(ambientLight);
  }

  private setupCamera() {
    // needed because we have the point light on the camera
    this.scene.add(this.camera);

    this.camera.up = new Vector3(0, 0, 1);
    this.camera.position.set(-this.maxX / 4, -this.maxY / 4, (this.maxX + this.maxY) / 2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new Vector3(this.maxX / 2, this.maxY / 2, 0);
    this.controls.update();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    this.render();
  }

  private render() {
    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  // // sdf
  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

playground = new Playground(urlHash, 250, 210);

playground.load();
