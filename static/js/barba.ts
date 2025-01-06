import barba from "@barba/core";
import { initComponents, destroyComponents } from "./components/index";
import { Overlay } from "./overlay.js";

const init = function (): void {
  initComponents();

  const overlayEl = document.querySelector(".overlay") as HTMLElement;

  const overlay = new Overlay(overlayEl, {
    rows: 9,
    columns: 17,
  });

  barba.init({
    prevent: ({ el }) => el.classList && el.classList.contains("prevent-barba"),
    transitions: [
      {
        name: "default",
        async leave(data) {
          const animation = overlay.show({
            duration: 0.25,
            ease: "power1.in",
            stagger: {
              grid: [overlay.options.rows, overlay.options.columns],
              from: "center",
              each: 0.025,
            },
          });

          return animation;
        },
        async enter(data) {
          destroyComponents();
          initComponents(data.next.container);

          window.scrollTo(0, 0);

          const page = data.next.container.dataset.page;
          document.body.dataset.page = page || "";
        },

        after(data) {
          const animation = overlay.hide({
            duration: 0.25,
            ease: "power1",
            stagger: {
              grid: [overlay.options.rows, overlay.options.columns],
              from: "center",
              each: 0.025,
            },
          });

          return animation;
        },
      },
    ],
  });
};

export { init, barba };
