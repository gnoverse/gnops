import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { BaseComponent } from "./base";

export class Stage extends BaseComponent {
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sizes: { width: number; height: number };
  private mouse: { x: number; y: number } = { x: 0, y: 0 };
  private model!: THREE.Object3D;
  //   private controls: OrbitControls | null = null;

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
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.position.set(0, 0.5, 3);
    this.scene.add(this.camera);

    // Controls
    // this.controls = new OrbitControls(this.camera, this.DOM.el);
    // this.controls.target.set(0, 0.75, 0);
    // this.controls.enableDamping = true;
  }

  private loadModels(): void {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("/models/gnome.gltf", (gltf) => {
      gltf.scene.scale.set(0.025, 0.025, 0.025);
      gltf.scene.children[0].castShadow = true;
      gltf.scene.children[0].receiveShadow = true;

      const group = new THREE.Group();
      this.scene.add(group);
      group.add(gltf.scene);
      this.model = group;

      const boundingBox = new THREE.Box3().setFromObject(this.model);
      const point = new THREE.Vector3();
      this.model.children[0].position.set(-boundingBox.getCenter(point).x, -boundingBox.getCenter(point).y, -boundingBox.getCenter(point).z);

      this.animateModelAppear();
    });
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 0, 2);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 1024;
    pointLight.shadow.mapSize.height = 1024;
    pointLight.shadow.camera.near = 0.2;
    pointLight.shadow.camera.far = 6;
    pointLight.position.set(-0.4, 0.4, 0.2);
    this.scene.add(pointLight);

    // const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
    // this.scene.add(pointLightHelper);
  }

  private animate(): void {
    const tick = () => {
      if (this.model?.children[0].children[0]) {
        this.model.children[0].rotation.y = (this.mouse.x * Math.PI) / 2;
        this.model.children[0].rotation.x = (this.mouse.y * Math.PI) / 4;
      }

      // Update controls
      //this.controls?.update();

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
    this.mouse.x = evt.clientX / this.sizes.width - 0.5;
    this.mouse.y = evt.clientY / this.sizes.height - 0.5;
  }

  animateModelAppear() {
    gsap.to(this.model.rotation, {
      y: Math.PI * 2,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.fromTo(
      this.model.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.6,
        ease: "power2.inOut",
      }
    );
    // gsap.from(this.DOM.el, { autoAlpha: 0, duration: 2 });
  }

  animateModelDisappear() {
    gsap.to(this.model.rotation, {
      y: -Math.PI * 2,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(this.model.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      ease: "power2.inOut",
    });
    // gsap.to(this.DOM.el, { autoAlpha: 0, duration: 2 });
  }

  destroy(): void {
    console.log("destroy");
    super.destroy();
    this.eventBindings.forEach(({ target, type, handler }) => {
      target?.removeEventListener(type, handler);
    });
    this.renderer.dispose();
    this.scene.clear();
  }
}
