import barba from "@barba/core";
import { initComponents, destroyComponents } from "./components/index";

const init = function (): void {
  initComponents();

  barba.init({
    prevent: ({ el }) => el.classList && el.classList.contains("prevent-barba"),
    transitions: [
      {
        name: "default",
        async leave(data) {
          console.log("Leaving page:", data.current.url);

          destroyComponents();
        },
        async enter(data) {
          window.scrollTo(0, 0);
          console.log("Entering page:", data.next.url);

          console.log(data.current.namespace);

          const page = data.next.container.dataset.page;
          document.body.dataset.page = page || "";

          initComponents();
        },
      },
    ],
  });
};

export { init };
