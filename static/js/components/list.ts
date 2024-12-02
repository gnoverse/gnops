import { BaseComponent } from "./base";

export class List extends BaseComponent {
  private loadBtn: HTMLLinkElement | null = null;

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
      lists: "[data-collection]",
      loadBtns: "[data-component-loadbtn]",
    });
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: this.DOM.el as HTMLElement,
        type: "click",
        handler: this.onLoadList.bind(this),
      },
      {
        target: document,
        type: "updateList",
        handler: this.onUpdateList.bind(this),
      },
    ];
  }

  private onLoadList(e: Event) {
    const target = e.target as HTMLLinkElement;
    if (target.dataset.componentLoadbtn) {
      e.preventDefault();
      this.loadList(target);
    }
  }

  private onUpdateList(e: Event) {
    const customEvent = e as CustomEvent<{ message: string }>;
    this.displayList(customEvent.detail.message);
  }

  displayList(item: string) {
    if (!Array.isArray(this.DOM.lists)) return;
    this.DOM.lists.forEach((list) => {
      list.classList[list.dataset.collection === item ? "remove" : "add"]("hidden");
    });
  }

  loadList(loadbtn: HTMLLinkElement) {
    this.loadBtn = loadbtn;
    const url = loadbtn.href;

    if (!url) {
      console.error("No URL found on the button.");
      return;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const listItems = doc.querySelector("#list-items");
          const nextBtn = doc.querySelector("#loadNext") as HTMLLinkElement | undefined;
          if (listItems) {
            this.updateList(loadbtn.dataset.componentLoadbtn, listItems, nextBtn?.href);
          } else {
            console.warn("Element #list-items not found in fetched content.");
          }
        } catch (error) {
          console.error("Error processing the fetched HTML:", error);
        }
      })
      .catch((error) => {
        console.error("Error fetching or parsing HTML:", error);
      });
  }

  updateList(listName: string | undefined, data: Element, loadMoreUrl: string | undefined) {
    this.DOM.lists;
    const listToUpdate = this.DOM.lists?.find((list: HTMLElement) => list.dataset.collection === listName);
    const listArticles = listToUpdate?.querySelector("[data-component-articles]");

    if (this.loadBtn && loadMoreUrl) {
      this.loadBtn.href = loadMoreUrl;
    } else if (this.loadBtn && !loadMoreUrl) {
      this.loadBtn.classList.add("hidden");
    }

    if (listArticles) {
      const fragment = document.createDocumentFragment();
      data.childNodes.forEach((child) => {
        fragment.appendChild(child.cloneNode(true));
      });
      listArticles.appendChild(fragment);
    }
  }

  destroy(): void {
    super.destroy();
  }
}
