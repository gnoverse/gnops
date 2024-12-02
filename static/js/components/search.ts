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
      // @ts-ignore
      this.pagefind = await import("/pagefind/pagefind.js");
      this.pagefind.init();
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

    const query = this.DOM.searchInput?.value ?? "";
    if (!query || !this.pagefind) {
      console.warn("Query is empty or Pagefind is not initialized");
      return;
    }

    try {
      document.dispatchEvent(
        new CustomEvent("list-displayList", {
          detail: { message: "search" },
        })
      );

      const results = await this.pagefind.search(query);
      const fiveResults = await Promise.all(results.results.slice(0, 6).map((r: any) => r.data()));

      if (fiveResults.length > 0) {
        document.dispatchEvent(
          new CustomEvent("list-updateList", {
            detail: {
              message: {
                listName: "search",
                data: fiveResults,
                loadMoreUrl: undefined,
              },
            },
          })
        );
      } else {
        console.log("No results found for query:", query);
      }
    } catch (error) {
      console.warn("Search error:", error);
    }
  }

  destroy(): void {
    if (this.pagefind) {
      this.pagefind.destroy();
    }
    super.destroy();
  }
}
