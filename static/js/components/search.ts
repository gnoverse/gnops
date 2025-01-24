import { BaseComponent } from "./base";
import { debounce } from "../utils";

export class Search extends BaseComponent {
  private pagefind: any | null = null;
  private searchResult: any | null = null;
  private resulPerLoad = 6;
  private loadedResults = 0;
  private isSearchDisplayed = false;

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

  private onVoidInput(e: Event) {
    document.dispatchEvent(
      new CustomEvent("stage-animateModel", {
        detail: {
          message: {
            animation: "stopSearching",
          },
        },
      })
    );
    this.VoidInput();
    this.isSearchDisplayed = false;
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: this.DOM.el,
        type: "input",
        handler: this.search.bind(this),
      },
      {
        target: document,
        type: "search-loadmore",
        handler: this.onLoadMore.bind(this),
      },
      { target: document, type: "search-voidInput", handler: this.onVoidInput.bind(this) },
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

  private VoidInput() {
    this.DOM.searchInput.value = "";
  }

  private debounceSearch = debounce(async () => {
    const query = this.DOM.searchInput?.value ?? "";
    if (!query || !this.pagefind) {
      console.warn("Query is empty or Pagefind is not initialized");
      return;
    }

    document.dispatchEvent(
      new CustomEvent("list-displayList", {
        detail: {
          message: {
            listName: "search",
            refresh: false,
          },
        },
      })
    );
    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, this.isSearchDisplayed ? 0 : 900));
    this.isSearchDisplayed = true;

    const searchPromise = this.pagefind.search(query);

    this.searchResult = await Promise.all([searchPromise, minDelay]).then(([searchResult]) => searchResult);

    document.dispatchEvent(
      new CustomEvent("tabs-displaySearchNav", {
        detail: { message: this.searchResult.results.length.toString() },
      })
    );

    this.loadedResults = 0;

    const initialResults = await Promise.all(this.searchResult.results.slice(0, this.resulPerLoad).map((r: any) => r.data()));

    this.loadedResults = initialResults.length;
    const hasMoreResults = this.loadedResults < this.searchResult.results.length;

    document.dispatchEvent(
      new CustomEvent("list-updateList", {
        detail: {
          message: {
            listName: "search",
            data: initialResults,
            loadMoreUrl: hasMoreResults,
            refresh: true,
          },
        },
      })
    );
    if (initialResults.length <= 0) {
      document.dispatchEvent(
        new CustomEvent("stage-animateModel", {
          detail: {
            message: {
              animation: "startSearching",
            },
          },
        })
      );

      console.warn("No results found for query:", query);
    } else {
      document.dispatchEvent(
        new CustomEvent("stage-animateModel", {
          detail: {
            message: {
              animation: "stopSearching",
            },
          },
        })
      );
    }
  }, 350);

  private async search(e: InputEvent) {
    e.preventDefault();

    try {
      this.pagefind.preload((e.target as HTMLInputElement).value);
      this.debounceSearch();
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
