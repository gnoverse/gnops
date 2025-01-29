import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import gsap from "gsap";

import { BaseComponent } from "./base";
import { barba, reduceMotion } from "../barba";

import { lerp } from "../utils";

export class Stage extends BaseComponent {
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sizes: { width: number; height: number };
  private mouse: { x: number; y: number } = { x: 0, y: 0 };
  private lerpedMouse: { x: number; y: number } = { x: 0, y: 0 };
  private lerpFactor = 0.1;
  private model!: THREE.Object3D;
  private modelState: "searching" | "cursor" | "hidden" = "hidden";
  private onMouseMoveHandler = this.onMouseMove.bind(this);
  private searchTimeline: gsap.core.Timeline | null = null;

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
    this.setupEvents();
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
      this.model.scale.set(0, 0, 0);

      if (barba.data.current.namespace === "home") {
        document.dispatchEvent(
          new CustomEvent("stage-animateModel", {
            detail: { message: { animation: "show", reduceMotion } },
          })
        );
      }
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
  }

  private animate(): void {
    const tick = () => {
      if (this.model?.children[0].children[0]) {
        this.lerpedMouse.x = lerp(this.lerpedMouse.x, this.mouse.x, this.lerpFactor);
        this.lerpedMouse.y = lerp(this.lerpedMouse.y, this.mouse.y, this.lerpFactor);

        this.model.children[0].rotation.y = (this.lerpedMouse.x * Math.PI) / 2;
        this.model.children[0].rotation.x = (this.lerpedMouse.y * Math.PI) / 4;
      }

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
        handler: this.onMouseMoveHandler,
      },
      {
        target: document,
        type: "stage-animateModel",
        handler: this.onAnimateModel.bind(this),
      },
    ];
  }

  private stopMouseMoveListener(): void {
    this.removeEvent({ target: window, type: "mousemove", handler: this.onMouseMoveHandler });
  }

  private startMouseMoveListener(): void {
    this.addEvent({ target: window, type: "mousemove", handler: this.onMouseMoveHandler });
  }

  private updateModelState(newState: "searching" | "cursor" | "hidden", action: () => void) {
    if (this.modelState === newState) return;
    this.modelState = newState;
    action();
  }

  private onAnimateModel(e: Event) {
    const customEvent = e as CustomEvent<{ message: any }>;
    const { animation, reduceMotion } = customEvent.detail.message;

    switch (animation) {
      case "show":
        this.updateModelState("cursor", () => this.animateModelAppear(reduceMotion));
        break;

      case "hide":
        this.updateModelState("hidden", () => this.animateModelDisappear(reduceMotion));
        break;

      case "startSearching":
        this.updateModelState("searching", () => {
          this.stopMouseMoveListener();
          this.mouse.x = 0;
          this.mouse.y = 0;
          this.animateModelSearching();
        });
        break;

      case "stopSearching":
        this.updateModelState("cursor", () => this.cancelModelSearching());
        break;
    }
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

  animateModelAppear(reduceMotion = false) {
    gsap.fromTo(
      this.model.rotation,
      {
        y: 0,
      },
      {
        y: Math.PI * 8,
        duration: reduceMotion ? 0 : 2,
        ease: "back.out(0.8)",
      }
    );
    gsap.fromTo(
      this.model.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: reduceMotion ? 0 : 1.6,
        ease: "power2.inOut",
      }
    );
  }

  animateModelDisappear(reduceMotion = false) {
    gsap.fromTo(
      this.model.rotation,
      { y: Math.PI * 8 },
      {
        y: Math.PI * 6,
        duration: reduceMotion ? 0 : 1,
        ease: "power2.inOut",
      }
    );
    gsap.to(this.model.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: reduceMotion ? 0 : 1,
      ease: "power2.inOut",
    });
  }

  animateModelSearching(reduceMotion = false) {
    this.searchTimeline = gsap.timeline();
    this.searchTimeline
      .to(this.model.rotation, {
        x: Math.PI / 4,
        y: Math.PI * 6 - Math.PI / 8,
        duration: reduceMotion ? 0 : 1,
        ease: "back.out(1.4)",
      })
      .to(this.model.rotation, {
        y: Math.PI * 6 - -Math.PI / 8,
        duration: reduceMotion ? 0 : 1,
        ease: "power4.inOut",
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.7,
      });
  }

  cancelModelSearching(reduceMotion = false) {
    if (this.searchTimeline) {
      this.searchTimeline.kill();
      this.searchTimeline = null;

      gsap.to(this.model.rotation, {
        x: 0,
        y: Math.PI * 8,
        z: 0,
        duration: reduceMotion ? 0 : 0.8,
        ease: "power2.inOut",
      });
      this.startMouseMoveListener();
    }
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
