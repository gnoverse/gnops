import barba from "@barba/core";
import { initComponents, destroyComponents } from "./components/index";
import { Overlay } from "./overlay.js";
import { ITransitionData, ISchemaPage } from "@barba/core/dist/core/src/src/defs";
import gsap from "gsap";

type OverlayAnimationType = "show" | "hide";
type AnimationOverlayOptions = {
  type: OverlayAnimationType;
  ease?: string;
  from?: number | [number, number] | "center" | "start" | "end" | "edges" | "random" | undefined;
  each?: number;
  duration?: number;
};

const initializeOverlay = (overlayEl: HTMLElement | null) => {
  if (!overlayEl) {
    throw new Error("Overlay element not found.");
  }

  return new Overlay(overlayEl, {
    rows: 9,
    columns: 17,
  });
};

const createOverlayAnimation = async (overlay: Overlay, options: AnimationOverlayOptions) => {
  return overlay[options.type]({
    duration: options.duration || 0.25,
    ease: options.ease || "power1",
    stagger: {
      grid: [overlay.options.rows, overlay.options.columns],
      from: options.from || "center",
      each: options.each || 0.025,
    },
  });
};

const updateTransformOrigin = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2 + window.scrollY;

  return `${centerX}px ${centerY}px`;
};

const overlayEl: HTMLElement | null = document.querySelector(".overlay");
const wrapper: HTMLElement | null = document.querySelector(".global-wapper");
const wrapperPerspective: HTMLElement | null = document.querySelector(".wrapper-perspective");

const overlay = initializeOverlay(overlayEl);

const loaderAnimation = async () => {
  const loader = document.querySelector("#loader");
  await createOverlayAnimation(overlay, {
    type: "show",
    ease: "power1.in",
  });
  gsap.set(loader, { autoAlpha: 0 });
  gsap.set(wrapperPerspective, { perspectiveOrigin: updateTransformOrigin() });
  gsap.fromTo(wrapper, { translateZ: "-100px" }, { translateZ: "0px", duration: 1 });

  await createOverlayAnimation(overlay, {
    type: "hide",
  });
};

const leaveAnimation = async (content: ISchemaPage) => {
  if (content.namespace === "home") {
    document.dispatchEvent(
      new CustomEvent("stage-animateModel", {
        detail: {
          message: {
            animation: "hide",
          },
        },
      })
    );
  }
  gsap.set(wrapperPerspective, { perspectiveOrigin: updateTransformOrigin() });
  gsap.to(wrapper, { translateZ: "-100px", duration: 1 });
  gsap.to(content.container, { autoAlpha: 0 });

  await createOverlayAnimation(overlay, {
    type: "show",
    ease: "power1.in",
  });
};

const enterAnimation = async (content: ISchemaPage) => {
  if (content.namespace === "home") {
    document.dispatchEvent(
      new CustomEvent("stage-animateModel", {
        detail: {
          message: {
            animation: "show",
          },
        },
      })
    );
  }
  gsap.set(wrapperPerspective, { perspectiveOrigin: updateTransformOrigin() });
  gsap.fromTo(wrapper, { translateZ: "100px" }, { translateZ: "0px", duration: 1 });
  gsap.from(content.container, { autoAlpha: 0 });
  await createOverlayAnimation(overlay, {
    type: "hide",
  });
};

const udpateComponents = (data: ITransitionData) => {
  destroyComponents(data.current.container);
  initComponents(data.next.container);
  window.scrollTo(0, 0);

  const page = data.next.container.dataset.page;
  document.body.dataset.page = page || "";
};

const init = () => {
  initComponents();

  barba.init({
    prevent: ({ el }) => el.classList?.contains("prevent-barba"),
    transitions: [
      {
        name: "default",
        async leave({ current }) {
          return leaveAnimation(current);
        },
        async enter(data) {
          udpateComponents(data);
        },
        async after({ next }) {
          return enterAnimation(next);
        },
      },
    ],
  });

  loaderAnimation();
};

export { init, barba };
