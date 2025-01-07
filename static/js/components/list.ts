import gsap from "gsap";
import { BaseComponent } from "./base";

export class List extends BaseComponent {
  private loadBtn: HTMLLinkElement | null = null;
  private lastActiveList: string = "all";

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
      searchMoreBtn: "[data-component-searchbtn]",
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
        target: this.DOM.searchMoreBtn as HTMLElement,
        type: "click",
        handler: this.onSearchClick.bind(this),
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
      {
        target: document,
        type: "list-voidList",
        handler: this.onVoidList.bind(this),
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

  private onVoidList(e: Event) {
    const customEvent = e as CustomEvent<{ message: string }>;
    this.voidList(customEvent.detail.message);
  }

  private onUpdateList(e: Event) {
    const customEvent = e as CustomEvent<{ message: any }>;
    const { listName, data, loadMoreUrl } = customEvent.detail.message;
    this.updateList(listName, data, loadMoreUrl);
  }

  private onSearchClick(e: Event) {
    document.dispatchEvent(new CustomEvent("search-loadmore"));
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

  displayList(item: string) {
    if (!Array.isArray(this.DOM.lists)) return;

    let activeList: HTMLElement | null = null;

    activeList = this.DOM.lists.find((list: HTMLElement) => list.dataset.collection === item) || null;
    const lastActiveList = this.DOM.lists.find((list: HTMLElement) => list.dataset.collection === this.lastActiveList) || null;

    if (!activeList || !lastActiveList) return;

    const lastArticles = Array.from(lastActiveList.querySelectorAll("article")).slice(0, 6);
    const newArticles = Array.from(activeList.querySelectorAll("article")).slice(0, 6);

    const tl = gsap.timeline();
    tl.to(lastArticles, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.1,
      ease: "power2.in",
      onComplete: () => {
        lastActiveList.classList.add("hidden");
        activeList.classList.remove("hidden");
        this.lastActiveList = activeList.dataset.collection || "all";
      },
    }).fromTo(
      newArticles,
      {
        opacity: 0,
        y: 20,
      },
      {
        duration: 0.5,
        stagger: 0.1,
        opacity: 1,
        y: 0,
        ease: "power2.out",
      }
    );
  }

  voidList(listName: string) {
    const listToVoid = this.DOM.lists.find((list: HTMLElement) => list.dataset.collection === listName);
    const art = listToVoid?.querySelector("[data-component-articles]");
    if (art) art.innerHTML = "";
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

  updateList(listName: string | undefined, data: any, loadMoreUrl: string | boolean | undefined) {
    const listToUpdate = this.DOM.lists?.find((list: HTMLElement) => list.dataset.collection === listName);
    const listArticles = listToUpdate?.querySelector("[data-component-articles]");

    let btn = typeof loadMoreUrl !== "boolean" ? this.loadBtn : this.DOM.searchMoreBtn;

    if (btn && loadMoreUrl) {
      if (btn instanceof HTMLAnchorElement && typeof loadMoreUrl !== "boolean") {
        btn.href = loadMoreUrl;
      }
      btn.classList.remove("hidden");
    } else if (!loadMoreUrl) {
      btn.classList.add("hidden");
    }

    if (listArticles) {
      const fragment = document.createDocumentFragment();
      const newArticles: HTMLElement[] = [];

      if (Array.isArray(data)) {
        Array.from(data).forEach((res) => {
          const articleContent = { url: res.url, genre: res.meta.section, title: res.meta.title, description: res.meta.summary, author: res.meta.author };
          const articleElement = this.createArticleHTML(articleContent);
          fragment.appendChild(articleElement);
          newArticles.push(articleElement);
        });
      } else {
        Array.from(data.childNodes).forEach((child) => {
          const clonedNode = (child as Node).cloneNode(true) as HTMLElement;
          fragment.appendChild(clonedNode);
          newArticles.push(clonedNode);
        });
      }

      listArticles.appendChild(fragment);

      gsap.from(newArticles, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }

  destroy(): void {
    super.destroy();
  }
}
