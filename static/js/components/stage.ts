import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { BaseComponent } from "./base";

export class Stage extends BaseComponent {
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private sizes: { width: number; height: number };
  private clock: THREE.Clock;

  constructor(el: HTMLElement) {
    super(el);

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight / 3,
    };

    this.init();
    this.setupEvents();
    this.bindEvents();
  }

  private init(): void {
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.loadModels();
    this.setupLights();
    this.animate();
  }

  private setupRenderer(): void {
    const { el } = this.DOM;

    this.renderer = new THREE.WebGLRenderer({
      canvas: el as HTMLCanvasElement,
      alpha: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.position.set(0.5, 0.5, 0.5);
    this.scene.add(this.camera);
  }

  private setupControls(): void {
    const { el } = this.DOM;
    this.controls = new OrbitControls(this.camera, el);
    this.controls.target.set(0, 0.75, 0);
    this.controls.enableDamping = true;
  }

  private loadModels(): void {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("/models/gnome.gltf", (gltf) => {
      gltf.scene.scale.set(0.025, 0.025, 0.025);
      gltf.scene.rotateY(0.75);
      this.scene.add(gltf.scene);
    });
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.camera.left = -7;
    directionalLight.shadow.camera.top = 7;
    directionalLight.shadow.camera.right = 7;
    directionalLight.shadow.camera.bottom = -7;
    directionalLight.position.set(-5, 5, 0);
    this.scene.add(directionalLight);
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: window,
        type: "resize",
        handler: this.onResize.bind(this),
      },
    ];
  }

  private onResize(): void {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight / 3;

    if (this.camera && this.renderer) {
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  private animate(): void {
    const tick = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      window.requestAnimationFrame(tick);
    };

    tick();
  }

  destroy(): void {
    super.destroy();
    this.eventBindings.forEach(({ target, type, handler }) => {
      target?.removeEventListener(type, handler);
    });
    this.renderer.dispose();
    this.scene.clear();
  }
}
