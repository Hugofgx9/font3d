global.THREE = require('three');

import * as THREE from 'three';
import gsap from 'gsap';

// init scene and camera 
let scene = new THREE.Scene();
let camera, uniforms, fov;
let fontTexture;
let mouse = new THREE.Vector2(0,0);

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

loadFont();
initLights();
initCamera();
onWindowResize();
update();


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

//font 

function loadFont () {

  let bitmap = document.createElement('canvas');
  let ctx = bitmap.getContext('2d');
  bitmap.width = 1000;
  bitmap.height = 1000;
  ctx.font = '200px MonumentExtended-Regular';

  ctx.fillStyle = 'white';
  ctx.fillText('Techno', 0, 300);
  ctx.fillText('Gender', 0, 600);
  ctx.fillText('Fluid', 0, 900);
  fontTexture = new THREE.Texture(bitmap) 
  fontTexture.needsUpdate = true;
}

let geometry = new THREE.PlaneGeometry( 400, 400, 0 );
let material = new THREE.MeshBasicMaterial( {
  map: fontTexture,
  //color: 0xffff00, 
  side: THREE.DoubleSide,
} );
let plane = new THREE.Mesh( geometry, material );
scene.add( plane );


// instantiate a loader
let loader = new THREE.TextureLoader();

// load a resource
loader.load(
  // resource URL
  'textures/land_ocean_ice_cloud_2048.jpg',

  // onLoad callback
  function ( texture ) {
    // in this example we create the material when the texture is loaded
    var material = new THREE.MeshBasicMaterial( {
      map: texture
     } );
  },
)



