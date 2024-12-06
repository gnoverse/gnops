import { BaseComponent } from "./base";

export class ArticleContent extends BaseComponent {
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
      codeblocks: ".highlight",
    });

    this.DOM.codeblocks.forEach((codeBlock: HTMLElement) => {
      this.createCopyBtn(codeBlock);
    });
  }

  protected setupEvents(): void {
    this.eventBindings = [
      {
        target: this.DOM.el,
        type: "click",
        handler: this.onCopyCode.bind(this),
      },
    ];
  }

  private createCopyBtn(codeBlock: HTMLElement) {
    // Crée un bouton
    const button = document.createElement("button");
    button.textContent = "Copy";
    button.classList.add("copy-btn");

    codeBlock.appendChild(button);
  }

  private onCopyCode(e: Event) {
    const target = e.target as HTMLElement;

    const button = target.closest<HTMLButtonElement>(".copy-btn");

    if (!button) return;

    const codeBlock = button.closest<HTMLElement>(".highlight");
    if (!codeBlock) return;

    const codeElement = codeBlock.querySelector<HTMLElement>("code");
    if (codeElement) {
      this.copyCode(codeElement, button);
    }
  }

  showCopyFeedback(button: HTMLElement) {
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1500);
  }

  async copyCode(el: HTMLElement, btnElement: HTMLButtonElement) {
    const sanitizedText = el.innerText || el.textContent || "";
    try {
      await navigator.clipboard.writeText(sanitizedText);
      this.showCopyFeedback(btnElement);
    } catch (err) {
      console.error("Copy error: ", err);
    }
  }

  destroy(): void {
    super.destroy();
  }
}
