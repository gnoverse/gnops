import { BaseComponent } from "./base";
import { barba } from "../barba";

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
      tabsBar: "[data-component-nav='tabs']",
      searchBar: "[data-component-nav='search']",
      searchCounter: "[data-component-nav-searchcount]",
      searchTabBack: "[data-component-tabback]",
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
      {
        target: this.DOM.searchTabBack,
        type: "click",
        handler: this.onTabBack.bind(this),
      },
      {
        target: document,
        type: "tabs-displaySearchNav",
        handler: this.onDisplaySearchBar.bind(this),
      },
    ];
  }

  private onTabClick(e: Event) {
    const target = e.target as HTMLElement;
    if (target.dataset.componentItem) {
      this.updateTab(target);
    }
  }

  private onTabBack(e: Event) {
    this.displayTabshBar();
    document.dispatchEvent(new CustomEvent("search-voidInput"));
  }

  private onDisplaySearchBar(e: Event) {
    const customEvent = e as CustomEvent<{ message: string }>;
    this.displaySearchBar(customEvent.detail.message);
  }

  displaySearchBar(counter: string) {
    this.DOM.searchBar.classList.replace("hidden", "flex");
    this.DOM.tabsBar.classList.replace("block", "hidden");
    this.DOM.searchCounter.textContent = counter;
  }

  displayTabshBar() {
    this.DOM.searchBar.classList.replace("flex", "hidden");
    this.DOM.tabsBar.classList.replace("hidden", "block");
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
