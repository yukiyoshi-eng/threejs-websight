import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import bg from "./images/sf3.jpg";

/**
 * デバッグ(色つけるときに追加)
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffffff",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * 必須の3要素
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();

//背景テクスチャ
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load(bg);
scene.background = bgTexture;

//Camera

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * オブジェクトを作成しよう
 */
//material
const material = new THREE.MeshPhysicalMaterial({
  color: "#3c94d7",
  metalness: 0.865,
  roughness: 0.373,
  flatShading: true,
});

gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

// Meshes
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.OctahedronGeometry(), material);
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
const mesh4 = new THREE.Mesh(new THREE.IcosahedronGeometry(), material);

/* 回転用に配置する */
// mesh1.position.set(2, 0, 0);
// mesh2.position.set(-1, 0, 0);
// mesh3.position.set(2, 0, -6);
// mesh4.position.set(5, 0, 3);

scene.add(mesh1, mesh2, mesh3, mesh4);
const sectionMeshes = [mesh1, mesh2, mesh3, mesh4];

/**
 * Particles
 */
//geometry
const particlesCount = 700;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

//Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.025,
});

//Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Light
 *  */
const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
directionalLight.position.set(0.5, 1, 0);
scene.add(directionalLight);

//ブラウザのリサイズ操作
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//cursor
const cursor = {};
cursor.x = 0;
cursor.y = 0;
// console.log(cursor);
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
  // console.log(cursor);
});

//wheel
let speed = 0;
let rotation = 0;
window.addEventListener("wheel", (event) => {
  // console.log(event.deltaY);
  speed += event.deltaY * 0.0002;
});

function rot() {
  rotation += speed;
  speed *= 0.93;
  // console.log(rotation);

  mesh1.position.x = 2 + 3.8 * Math.cos(rotation);
  mesh1.position.z = -3 + 3.8 * Math.sin(rotation);
  mesh2.position.x = 2 + 3.8 * Math.cos(rotation + Math.PI / 2);
  mesh2.position.z = -3 + 3.8 * Math.sin(rotation + Math.PI / 2);
  mesh3.position.x = 2 + 3.8 * Math.cos(rotation + Math.PI);
  mesh3.position.z = -3 + 3.8 * Math.sin(rotation + Math.PI);
  mesh4.position.x = 2 + 3.8 * Math.cos(rotation + (3 * Math.PI) / 2);
  mesh4.position.z = -3 + 3.8 * Math.sin(rotation + (3 * Math.PI) / 2);

  window.requestAnimationFrame(rot);
}

rot();

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

//アニメーション
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  let deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  // console.log(deltaTime); 0.013　パソコンの性能によってデルタタイムが異なる。

  //camera animate
  // camera.position.y = (-scrollY / sizes.height) * objectDistance;

  const parallaxX = cursor.x * 0.6;
  const parallaxY = -cursor.y * 0.6;
  camera.position.x += (parallaxX - camera.position.x) * 5 * deltaTime;
  camera.position.y += (parallaxY - camera.position.y) * 5 * deltaTime;

  //mesh aniamte
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();