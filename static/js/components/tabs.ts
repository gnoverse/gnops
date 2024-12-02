import { BaseComponent } from "./base";
import gsap from "gsap";

export class Tabs extends BaseComponent {
  constructor(el: HTMLElement) {
    super(el);

    this.init();
    this.setupEvents();
    this.bindEvents();
  }

  private init() {
    const { el } = this.DOM;
    if (!el) return;

    this.initializeDOM({
      tabsMenuItem: "[data-component-item]",
      navbar: "[data-component-navbar]",
    });

    if (this.DOM.tabsMenuItem) {
      this.updateTab(this.DOM.tabsMenuItem[0], true);
    }
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: this.DOM.el,
        type: "click",
        handler: this.onTabClick.bind(this),
      },
    ];
  }

  private onTabClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.dataset.componentItem) {
      this.updateTab(target);
    }
  }

  updateTab(el: HTMLElement, instant = false) {
    const barInfo = el.getBoundingClientRect();
    gsap.to(this.DOM.navbar, {
      width: barInfo.width,
      x: barInfo.x - (this.DOM.el?.offsetLeft ?? 0),
      duration: instant ? 0 : 0.4,
    });

    const tabName = el.dataset.componentItem ?? "";
    this.updateList(tabName);
  }

  updateList(listName: string) {
    if (listName === "") return;
    document.dispatchEvent(
      new CustomEvent("list-displayList", {
        detail: { message: listName },
      })
    );
  }

  destroy(): void {
    super.destroy();
  }
}
