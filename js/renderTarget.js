global.THREE = require('three');
const createGeometry = require('three-bmfont-text');
const loadFont = require('load-bmfont');
const MSDFShader = require('three-bmfont-text/shaders/msdf');

const fontFile = require('../asset/monument_fonts/MonumentExtended-Regular.fnt');
const fontAtlas = require('../asset/monument_fonts/MonumentExtended-Regular.png');

import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from '../glsl/vertexShaderPlane.glsl';
import fragmentShader from '../glsl/fragmentShaderPlane.glsl';

// init scene and camera 
let scene = new THREE.Scene();
let camera, uniforms, fov;
let text, fontMaterial, fontGeometry;
let planeMaterial, planeGeometry;
let rt, rtCamera, rtScene, plane;

let mouse = new THREE.Vector2(0,0);
let mouseSpeed, timestamp, mY;
timestamp = mY = 0;

const container = document.getElementById('canvas');
const perspective = 800;
let renderer = new THREE.WebGLRenderer ({
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
loadBMF();
onWindowResize();


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
  gsap.to(mouse, 0.5, {
    x: event.clientX,
    y: event.clientY,
  });

  //mouseSpeedUpdate(event);
}

function mouseSpeedUpdate(event) {
  let now = Date.now();
  currentmY = event.screenY;

  let dt = now - timestamp;
  let distance = Math.abs(currentmY - mY);
  let speed = Math.round(distance / dt * 1000);

  mouseSpeed = speed.toFixed(1);

  mY = currentmY;
  timestamp = now;
}

// Update
function update() {

  requestAnimationFrame( update );
  planeMaterial.uniforms.u_time.value = clock.getElapsedTime();
  renderer.setRenderTarget(rt);
  renderer.render(rtScene, rtCamera);

  renderer.setRenderTarget(null);
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
function loadBMF() {
  loadFont(fontFile, (err, font) => {
    // Create a geometry of packed bitmap glyphs
    fontGeometry = createGeometry({
      font: font,
      text: 'FLUIDITY'
    });
    
    // Load texture containing font glyphs
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(fontAtlas, (texture) => {
      fontMaterial = new THREE.RawShaderMaterial(
        MSDFShader({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          negate: false,
          color: 0x313131,
        })
      );

      //callback function here;
      createRenderTarget();
      update();
    });
  });
};

//render target
function createRenderTarget() {
  // Render Target setup
  rt = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight, 
    {
      alpha: true,
    }
  );

  rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  rtCamera.position.z = 2.5;

  rtScene = new THREE.Scene();
  //rtScene.background = new THREE.Color("#000000");

  text = new THREE.Mesh(fontGeometry, fontMaterial);

  // Adjust text dimensions
  text.position.set(-0.75, -0.4, 0);
  text.rotation.set(Math.PI, 0, 0);
  text.scale.set(0.006, 0.006, 1);

  // Add text to RT scene
  rtScene.add(text);

  //scene.add(text);

  createPlane();
 
  //scene.add(text); // Add to main scene
}

function createPlane() {
  planeGeometry = new THREE.PlaneGeometry(1, 1, 1);

  planeMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      u_time: { value: 0 },
      u_texture: { value: rt.texture },
      u_mouse: { value: mouse },
      u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
      u_speed: { value: mouseSpeed },
    },
    defines: {
    // tofixed(1) tronque le nombre avec 1 nombre après la virgule
     PR: window.devicePixelRatio.toFixed(1)
    },
    side: THREE.DoubleSide,
  });

  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.scale.set(800,800,0);

  scene.add(plane);
}
