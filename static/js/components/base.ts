interface Component {
  destroy: () => void;
}

interface EventBinding {
  target: EventTarget | null;
  type: string;
  handler: any;
}

const BaseComponent = class {
  protected DOM: Record<string, any | null> = {
    el: null as HTMLElement | null,
  };

  protected eventBindings: EventBinding[] = [];

  constructor(el: HTMLElement) {
    this.DOM.el = el;
  }

  protected initializeDOM(selectors: Record<string, string>) {
    const { el } = this.DOM;
    if (!el) return;

    Object.keys(selectors).forEach((key) => {
      const selector = selectors[key];

      const elements = Array.from(el.querySelectorAll(selector));

      this.DOM[key] = elements.length === 1 ? (elements[0] as HTMLElement) : elements.length > 1 ? (elements as HTMLElement[]) : null;
    });
  }

  protected bindEvents() {
    this.eventBindings.forEach(({ target, type, handler }) => {
      target?.addEventListener(type, handler);
    });
  }

  protected unbindEvents() {
    this.eventBindings.forEach(({ target, type, handler }) => {
      target?.removeEventListener(type, handler);
    });
  }

  protected addEvent(event: { target: EventTarget; type: string; handler: any }): void {
    event.target.addEventListener(event.type, event.handler);
    this.eventBindings.push(event);
  }

  protected removeEvent(event: { target: EventTarget; type: string; handler: any }): void {
    event.target.removeEventListener(event.type, event.handler);
    this.eventBindings = this.eventBindings.filter((e) => e.target !== event.target && e.type !== event.type && e.handler !== event.handler);
  }

  protected setupEvents(): void {}

  destroy(): void {
    this.unbindEvents();
  }
};

export { BaseComponent };
