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
        type: "list-displayList",
        handler: this.onDisplayList.bind(this),
      },
      {
        target: document,
        type: "list-updateList",
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

  private onDisplayList(e: Event) {
    const customEvent = e as CustomEvent<{ message: string }>;
    this.displayList(customEvent.detail.message);
  }

  private onUpdateList(e: Event) {
    const customEvent = e as CustomEvent<{ message: any }>;
    const { listName, data, loadMoreUrl } = customEvent.detail.message;
    this.updateList(listName, data, loadMoreUrl);
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

  private createArticleHTML({ url = "", genre = "", title = "", description = "", author = "" }: { url: string; genre: string; title: string; description: string; author: string }): HTMLElement {
    const template = document.createElement("template");
    template.innerHTML = `
      <article class="listArticle">
        <a href="${url}">
          <span class="listArticle__illu">
            <span class="relative">
              <span class="listArticle__label">${genre}</span>
            </span>
          </span>
          <h2>${title}</h2>
          <p>${description}</p>
          <ul>
            <li>
              <span>By</span> <span class="listArticle__author">${author}</span>
            </li>
          </ul>
        </a>
      </article>
    `.trim();

    return template.content.firstElementChild as HTMLElement;
  }

  updateList(listName: string | undefined, data: any, loadMoreUrl: string | undefined) {
    const listToUpdate = this.DOM.lists?.find((list: HTMLElement) => list.dataset.collection === listName);
    const listArticles = listToUpdate?.querySelector("[data-component-articles]");

    if (this.loadBtn && loadMoreUrl) {
      this.loadBtn.href = loadMoreUrl;
    } else if (this.loadBtn && !loadMoreUrl) {
      this.loadBtn.classList.add("hidden");
    }

    if (listArticles) {
      const fragment = document.createDocumentFragment();

      console.log(data);
      if (Array.isArray(data)) {
        Array.from(data).forEach((res) => {
          const articleContent = { url: res.url, genre: res.meta.section, title: res.meta.title, description: res.meta.summary, author: res.meta.author };
          fragment.appendChild(this.createArticleHTML(articleContent));
        });
      } else {
        Array.from(data.childNodes).forEach((child) => {
          const clonedNode = (child as Node).cloneNode(true);
          fragment.appendChild(clonedNode);
        });
      }
      listArticles.appendChild(fragment);
    }
  }

  destroy(): void {
    super.destroy();
  }
}
