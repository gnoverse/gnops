import { BaseComponent } from "./base";

export class Search extends BaseComponent {
  private pagefind: any | null = null;
  private searchResult: any | null = null;
  private resulPerLoad = 6;
  private loadedResults = 0;

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

  private onLoadMore(e: Event) {
    this.loadMore();
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: this.DOM.el,
        type: "submit",
        handler: this.search.bind(this),
      },
      {
        target: document,
        type: "search-loadmore",
        handler: this.onLoadMore.bind(this),
      },
    ];
  }

  private async loadMore() {
    if (!this.searchResult) {
      console.warn("No search results available to load more.");
      return;
    }

    const startIndex = this.loadedResults;
    const endIndex = startIndex + this.resulPerLoad;

    const nextResults = await Promise.all(this.searchResult.results.slice(startIndex, endIndex).map((r: any) => r.data()));

    this.loadedResults += nextResults.length;

    const hasMoreResults = this.loadedResults < this.searchResult.results.length;

    document.dispatchEvent(
      new CustomEvent("list-updateList", {
        detail: {
          message: {
            listName: "search",
            data: nextResults,
            loadMoreUrl: hasMoreResults,
          },
        },
      })
    );
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

      document.dispatchEvent(
        new CustomEvent("list-voidList", {
          detail: { message: "search" },
        })
      );

      this.searchResult = await this.pagefind.search(query);
      this.loadedResults = 0;

      const initialResults = await Promise.all(this.searchResult.results.slice(0, this.resulPerLoad).map((r: any) => r.data()));

      this.loadedResults = initialResults.length;

      const hasMoreResults = this.loadedResults < this.searchResult.results.length;

      if (initialResults.length > 0) {
        document.dispatchEvent(
          new CustomEvent("list-updateList", {
            detail: {
              message: {
                listName: "search",
                data: initialResults,
                loadMoreUrl: hasMoreResults,
              },
            },
          })
        );
      } else {
        console.warn("No results found for query:", query);
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
