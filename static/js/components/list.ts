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
    const customEvent = e as CustomEvent<{ message: any }>;
    const { listName, refresh } = customEvent.detail.message;
    this.displayList(listName, refresh);
  }

  private onVoidList(e: Event) {
    const customEvent = e as CustomEvent<{ message: any }>;
    this.voidList(customEvent.detail.message);
  }

  private onUpdateList(e: Event) {
    const customEvent = e as CustomEvent<{ message: any }>;
    const { listName, data, loadMoreUrl, refresh } = customEvent.detail.message;
    this.updateList(listName, data, loadMoreUrl, refresh);
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

  displayList(item: string, refresh = false) {
    if (!Array.isArray(this.DOM.lists)) return;
    if (this.lastActiveList === item) return;

    let activeList: HTMLElement | null = null;

    activeList = this.DOM.lists.find((list: HTMLElement) => list.dataset.collection === item) || null;
    const lastActiveList = this.DOM.lists.find((list: HTMLElement) => list.dataset.collection === this.lastActiveList) || null;

    if (!activeList || !lastActiveList) return;

    const lastArticles = Array.from(lastActiveList.querySelectorAll("article")).slice(0, 8);
    const newArticles = Array.from(activeList.querySelectorAll("article")).slice(0, 8);

    const tl = gsap.timeline();
    tl.to(lastArticles, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      stagger: 0.1,
      ease: "power2.in",
      onComplete: () => {
        refresh && (lastActiveList.querySelector("[data-component-articles]").innerHTML = "");

        lastActiveList.classList.add("hidden");
        activeList.classList.remove("hidden");
        this.lastActiveList = activeList.dataset.collection || "all";
      },
    });

    if (newArticles.length > 0) {
      tl.fromTo(
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

  async updateList(listName: string | undefined, data: any, loadMoreUrl: string | boolean | undefined, refresh = false) {
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

    if (refresh) {
      const oldArticles = listArticles.querySelectorAll("article");
      if (oldArticles.length > 0) {
        await gsap.to(oldArticles, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          onComplete: () => {
            if (listArticles) listArticles.innerHTML = "";
          },
        });
      }
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

      gsap.fromTo(
        newArticles,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }

  destroy(): void {
    super.destroy();
  }
}
