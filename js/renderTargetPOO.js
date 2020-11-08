global.THREE = require('three');
const createGeometry = require('three-bmfont-text');
const loadFont = require('load-bmfont');
const MSDFShader = require('three-bmfont-text/shaders/msdf');

const fontFile = require('../asset/monument_fonts/MonumentExtended-Regular.fnt');
const fontAtlas = require('../asset/monument_fonts/MonumentExtended-Regular.png');
const imgDataMosh = require('../asset/img/datamoshing5.64e20d78.jpg');

import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from '../glsl/vertexShaderPlane.glsl';
import fragmentShader from '../glsl/fragmentShaderPlane.glsl';


class threeFont {
	constructor(opts = {}){
	
		this.options = opts;

		this.scene = new THREE.Scene();

		this.mouse = new THREE.Vector2(0,0);
		this.prevMouse = new THREE.Vector2(0,0);
		this.speed = this.targetSpeed = 0;

		this.container = document.getElementById('canvas');
		this.perspective = 800;
		this.renderer = new THREE.WebGLRenderer ({
			//canvas: container, (if canvas is already in DOM)
			antialias: true,
			alpha: true,
		});
		this.clock = new THREE.Clock();
		document.body.appendChild ( this.renderer.domElement );

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.initLights();
		this.initCamera();
		this.loadBMF();
		this.onWindowResize();
		this.listenWindow();

	}

	initLights() {
		this.ambientLight = new THREE.AmbientLight( 0xffffff, 2);
		this.scene.add(this.ambientLight);
	}

	initCamera() {
		this.fov = (180 * (2 * Math.atan(window.innerHeight / 2 / this.perspective ))) / Math.PI;
		this.camera = new THREE.PerspectiveCamera( 
			this.fov, 
			window.innerWidth / window.innerHeight , 
			1 , 
			1000 
		);
		this.camera.position.set(0,0, this.perspective );
	}

		//load font
	loadBMF() {
		loadFont(this.options.fontFile, (err, font) => {
			// Create a geometry of packed bitmap glyphs
			this.fontGeometry = createGeometry({
				font: font,
				text: 'FLUIDITY'
			});


			// Load texture containing font glyphs
			this.textureLoader = new THREE.TextureLoader();
			this.textureLoader.load(this.options.fontAtlas, (texture) => {

				this.fontMaterial = new THREE.RawShaderMaterial(
					MSDFShader({
						map: texture,
						side: THREE.DoubleSide,
						transparent: true,
						negate: false,
						color: 0x313131,
					})
				);

				//callback function here;
				this.createRenderTarget();
				this.update();
			});
		});
	}

	//render target
	createRenderTarget() {
		// Render Target setup
		this.rt = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight, 
			{
				alpha: true,
			}
		);

		this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
		this.rtCamera.position.z = 2.5;

		this.rtScene = new THREE.Scene();
		//rtScene.background = new THREE.Color("#000000");

		this.text = new THREE.Mesh(this.fontGeometry, this.fontMaterial);

		// Adjust text dimensions
		this.text.position.set(-0.75, -0.4, 0);
		this.text.rotation.set(Math.PI, 0, 0);
		this.text.scale.set(0.006, 0.006, 1);

		// Add text to RT scene
		this.rtScene.add(this.text);

		this.createPlane();
	 
		//scene.add(text); // Add to main scene
	}

	createPlane() {
		this.planeGeometry = new THREE.PlaneGeometry(1, 1, 1);

		this.loaderData = new THREE.TextureLoader();
		this.dataMoshTexture = this.loaderData.load(this.options.imgDataMosh);

		this.planeMaterial = new THREE.ShaderMaterial({
			vertexShader: this.options.planeVertexShader,
			fragmentShader: this.options.planeFragmentShader,
			uniforms: {
				u_time: { type: 'f', value: 0 },
				u_texture: { type: 't', value: this.rt.texture },
				u_dataMoshTexture: { type: 't', value: this.dataMoshTexture },
				u_mouse: { value: this.mouse },
				u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
				u_speed: { value: this.targetSpeed },
			},
			defines: {
			// tofixed(1) tronque le nombre avec 1 nombre après la virgule
			 PR: window.devicePixelRatio.toFixed(1)
			},
			side: THREE.DoubleSide,
		});

		this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
		this.plane.scale.set(800,800,0);

		this.scene.add(this.plane);
	}

	// Update
	update() {

		this.getSpeed();
		this.plane.material.uniforms.u_time.value = this.clock.getElapsedTime();
		this.plane.material.uniforms.u_speed.value = Math.max( 0.0001, Math.min(this.targetSpeed / 1000., 0.3));
		this.renderer.setRenderTarget(this.rt);
		this.renderer.render(this.rtScene, this.rtCamera);

		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame( this.update.bind(this) );
	}

	updateCamera() {
		this.fov = ( 180 * ( 2 * Math.atan(window.innerHeight / 2 / this.perspective ))) / Math.PI;
		this.camera.fov = this.fov;
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}

	listenWindow() {
			if ('ontouchstart' in window) {
			document.addEventListener('touchmove', (ev) => { this.onMouseMove(ev) });
		} else {
			window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
			document.addEventListener('mousemove', (ev) => { this.onMouseMove(ev) });
		}
	}

	onWindowResize() {
		this.updateCamera;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	onMouseMove (event) {
		gsap.to(this.mouse, 0.5, {
			x: event.clientX,
			y: event.clientY,
		});
	}

  getSpeed(){
    this.speed = Math.sqrt( (this.prevMouse.x- this.mouse.x)**2 + (this.prevMouse.y- this.mouse.y)**2 );

    //dicrease or increase speed value
    this.targetSpeed -= 0.8 *(this.targetSpeed - this.speed);

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

	mouseSpeedUpdate(event) {
		this.now = Date.now();
		this.currentmY = event.screenY;

		this.dt = this.now - this.timestamp;
		this.distance = Math.abs(this.currentmY - this.mY);

		//globaly between 0 and 10 000
		this.mouseSpeed = Math.round(this.distance / this.dt * 1000);

		this.mY = this.currentmY;
		this.timestamp = this.now;

	}
}

const font = new threeFont( {
	planeVertexShader: vertexShader, 
	planeFragmentShader: fragmentShader,
	fontFile: fontFile,
	fontAtlas: fontAtlas,
	imgDataMosh: imgDataMosh,
});
