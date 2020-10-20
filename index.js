global.THREE = require('three');
const createGeometry = require('three-bmfont-text');
const loadFont = require('load-bmfont');
const MSDFShader = require('three-bmfont-text/shaders/msdf');

const fontFile = require('/asset/OpenSansfnt/OpenSans-Regular.fnt');
const fontAtlas = require('/asset/OpenSansfnt/OpenSans-Regular.png');

import * as THREE from 'three';

// init scene and camera 
let scene = new THREE.Scene();
let camera, uniforms, fov;
const container = document.getElementById('canvas');
const perspective = 800;
let renderer = new THREE.WebGL1Renderer ({
  //canvas: container,
  antialias: true,
  alpha: true,
});
const clock = new THREE.Clock();
document.body.appendChild ( renderer.domElement );

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

initLights();
initCamera();
onWindowResize();
update ();


function initLights() {
  const ambientLight = new THREE.AmbientLight( 0xffffff, 2);
  scene.add(ambientLight);
}

function initCamera() {
  fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
  camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0,0, perspective);
}

function updateCamera () {
  fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
  camera.fov =fov;
  camera.aspect =window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onWindowResize (event) {
  updateCamera();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove (event) {
  // gsap.to(mouse, 0.5, {
  //   x: event.clientX,
  //   y: event.clientY,
  // });
}

// Update
function update() {
  requestAnimationFrame( update );
  renderer.render(scene, camera);
  //mesh.rotation.y += 0.01;
}

if ('ontouchstart' in window){
  document.addEventListener('touchmove', (ev) => { onMouseMove(ev) });
}else{
  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener('mousemove', (ev) => { onMouseMove(ev) });
}


//load font
loadFont(fontFile, (err, font) => {
  // Create a geometry of packed bitmap glyphs
  const geometry = createGeometry({
    font: font,
    text: 'OCEAN'
  });
  
  // Load texture containing font glyphs
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(fontAtlas, (texture) => {
    // Start and animate renderer
    initFont(geometry, texture);
  });
});

function initFont(geometry, texture) {
  // Create material with msdf shader from three-bmfont-text
  const material = new THREE.RawShaderMaterial(MSDFShader({
    map: texture,
    color: 0x0000ff, // We'll remove it later when defining the fragment shader
    side: THREE.DoubleSide,
    transparent: true,
    negate: false,
  }));

  // Create mesh of text       
  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-80, 0, 0); // Move according to text size
  mesh.rotation.set(Math.PI, 0, 0); // Spin to face correctly
  scene.add(mesh);
}

