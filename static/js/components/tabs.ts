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
      tabsBar: "[data-component-nav='tabs']",
      searchBar: "[data-component-nav='search']",
      searchCounter: "[data-component-nav-searchcount]",
      searchTabBack: "[data-component-tabback]",
    });
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
    this.updateTab(this.DOM.tabsMenuItem[0], true, true);
  }

  private onDisplaySearchBar(e: Event) {
    const customEvent = e as CustomEvent<{ message: string }>;
    this.displaySearchBar(customEvent.detail.message);
  }

  displaySearchBar(counter: string) {
    this.DOM.searchCounter.textContent = counter;

    gsap.to(this.DOM.searchBar, { autoAlpha: 1, duration: 0.4 });
    gsap.to(this.DOM.tabsBar, { autoAlpha: 0, duration: 0.4 });
  }

  displayTabshBar() {
    gsap.to(this.DOM.searchBar, { autoAlpha: 0, duration: 0.4 });
    gsap.to(this.DOM.tabsBar, { autoAlpha: 1, duration: 0.4 });
  }

  updateTab(el: HTMLElement, instant = false, refresh = false) {
    const parent = el.closest("ul");
    if (!parent) return;

    const barInfo = el.getBoundingClientRect();
    const parentInfo = parent.getBoundingClientRect();

    const relativeBarInfo = {
      width: barInfo.width,
      x: barInfo.x - parentInfo.x,
    };

    gsap.to(this.DOM.navbar, {
      width: relativeBarInfo.width,
      x: relativeBarInfo.x,
      duration: instant ? 0 : 0.4,
    });

    const tabName = el.dataset.componentItem ?? "";
    this.updateList(tabName, refresh);
  }

  updateList(listName: string, refresh = false) {
    if (listName === "") return;
    document.dispatchEvent(
      new CustomEvent("list-displayList", {
        detail: {
          message: {
            listName,
            refresh,
          },
        },
      })
    );
  }

  destroy(): void {
    super.destroy();
  }
}
