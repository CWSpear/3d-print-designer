import io from 'socket.io-client';
import {
  BufferGeometry,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer,
} from 'three';
import { StlFileLoader } from './util/stl-file-loader';


const socket = io('http://localhost:8382');

socket.on('ready', () => {
  console.log('Server online');
});

socket.on('file-updated', () => refreshItem());

function refreshItem() {
  console.log('File Updated!');
}


(async () => {
  console.log('test');

  const container = document.createElement('div');
  document.body.appendChild(container);

  const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 15);
  camera.position.set(3, 0.15, 3);

  const cameraTarget = new Vector3(0, -0.25, 0);

  const scene = new Scene();
  scene.background = new Color(0x72645b);
  scene.fog = new Fog(0x72645b, 2, 15);


  // Ground

  const plane = new Mesh(
    new PlaneBufferGeometry(40, 40),
    new MeshPhongMaterial({ color: 0x999999, specular: 0x101010 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  scene.add(plane);

  plane.receiveShadow = true;

  // load our object
  const loader = new StlFileLoader();
  loader.setResponseType('arraybuffer');
  const geometry: BufferGeometry = await loader.loadAndParse('/build/spirit-island/spirit-island-token-holder.stl');

  console.log(geometry);

  const material = new MeshPhongMaterial({ color: 0xff5533, specular: 0x111111, shininess: 200 });
  const mesh = new Mesh(geometry, material);

  mesh.position.set(0, -0.25, 0.6);
  mesh.rotation.set(0, -Math.PI / 2, 0);
  mesh.scale.set(0.5, 0.5, 0.5);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  // Lights

  scene.add(new HemisphereLight(0x443333, 0x111122));

  addShadowedLight(1, 1, 1, 0xffffff, 1.35);
  addShadowedLight(0.5, 1, -1, 0xffaa00, 1);

  // renderer

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = sRGBEncoding;

  renderer.shadowMap.enabled = true;

  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  animate();

  function addShadowedLight(x: number, y: number, z: number, color: Color | string | number, intensity: number) {
    const directionalLight = new DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = -0.002;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    render();
  }

  function render() {
    const timer = Date.now() * 0.0005;

    camera.position.x = Math.cos(timer) * 3;
    camera.position.z = Math.sin(timer) * 3;

    camera.lookAt(cameraTarget);

    renderer.render(scene, camera);
  }
})().catch(err => console.error(err));
