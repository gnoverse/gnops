import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { BaseComponent } from "./base";

export class Stage extends BaseComponent {
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sizes: { width: number; height: number };
  private mouse: { x: number; y: number } = { x: 0, y: 0 };
  private model!: THREE.Object3D;

  constructor(el: HTMLElement) {
    super(el);

    this.scene = new THREE.Scene();

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.init();
    this.setupEvents();
    this.bindEvents();
  }

  private init(): void {
    this.setupRenderer();
    this.setupCamera();
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
    this.camera.position.set(0, 0.2, 1.2);
    this.scene.add(this.camera);
  }

  private loadModels(): void {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("/models/gnome.gltf", (gltf) => {
      gltf.scene.scale.set(0.025, 0.025, 0.025);
      gltf.scene.position.set(0, 0, 0);
      this.scene.add(gltf.scene);
      this.model = gltf.scene;
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

  private animate(): void {
    const tick = () => {
      // Update camera position based on mouse movement
      //   this.camera.position.x = Math.sin(this.mouse.x * Math.PI * 2) * 2;
      //   this.camera.position.z = Math.cos(this.mouse.x * Math.PI * 2) * 2;
      //   this.camera.position.y = this.mouse.y * 1;
      //   this.camera.lookAt(this.scene.position);

      this.renderer.render(this.scene, this.camera);

      window.requestAnimationFrame(tick);
    };

    tick();
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: window,
        type: "resize",
        handler: this.onResize.bind(this),
      },
      {
        target: window,
        type: "mousemove",
        handler: this.onMouseMove.bind(this),
      },
    ];
  }

  private onResize(): void {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    if (this.camera && this.renderer) {
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  private onMouseMove(evt: MouseEvent): void {
    this.mouse.x = -evt.clientX / this.sizes.width - 0.5;
    this.mouse.y = evt.clientY / this.sizes.height - 0.5;
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
