import { BaseComponent } from "./base";

export class Search extends BaseComponent {
  private pagefind: any | null = null;

  constructor(el: HTMLElement) {
    super(el);
    this.DOM.el = el;

    this.init();
    this.setupEvents();
    this.bindEvents();

    this.initPagefind();
  }

  private async initPagefind() {
    try {
      this.pagefind = await import("/pagefind/pagefind.js");
      this.pagefind.init();
      console.log("Pagefind initialized", this.pagefind);
    } catch (error) {
      console.error("Failed to load Pagefind:", error);
    }
  }

  private init() {
    const { el } = this.DOM;
    if (!el) return;

    this.initializeDOM({
      searchInput: "[data-component-input]",
    });
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: this.DOM.el,
        type: "submit",
        handler: this.search.bind(this),
      },
    ];
  }

  private async search(e: Event) {
    e.preventDefault();
    console.log("Search triggered");

    const query = this.DOM.searchInput?.value ?? "";
    if (!query || !this.pagefind) {
      console.warn("Query is empty or Pagefind is not initialized");
      return;
    }

    try {
      const results = await this.pagefind.search(query);
      if (results.results.length > 0) {
        const firstResult = await results.results[0].data();
        console.log("First result data:", firstResult);
      } else {
        console.log("No results found for query:", query);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  destroy(): void {
    if (this.pagefind) {
      this.pagefind.destroy();
    }
    super.destroy();
  }
}
