import gsap from "gsap";

class Cell {
  DOM: Record<string, HTMLElement | null> = {
    el: null,
  };
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.DOM.el = document.createElement("div");
    gsap.set(this.DOM.el, { willChange: "opacity, transform" });
    this.row = row;
    this.column = column;
  }
}

export class Overlay {
  DOM: { el: HTMLElement | null } = {
    el: null,
  };
  cells: Cell[][] = [];
  options: {
    rows: number;
    columns: number;
  } = {
    rows: 10,
    columns: 10,
  };

  constructor(DOM_el: HTMLElement, customOptions: Partial<{ rows: number; columns: number }> = {}) {
    this.DOM.el = DOM_el;

    this.options = { ...this.options, ...customOptions };

    this.DOM.el.style.setProperty("--columns", this.options.columns.toString());

    this.cells = Array.from({ length: this.options.rows }, () => new Array(this.options.columns));

    for (let i = 0; i < this.options.rows; i++) {
      for (let j = 0; j < this.options.columns; j++) {
        const cell = new Cell(i, j);
        this.cells[i][j] = cell;
        this.DOM.el.appendChild(cell.DOM.el!);
      }
    }
  }

  show(customConfig: Partial<gsap.TweenVars> = {}): Promise<void> {
    return new Promise((resolve) => {
      const defaultConfig: gsap.TweenVars = {
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "none",
        stagger: {
          grid: [this.options.rows, this.options.columns],
          from: 0,
          each: 0.05,
        },
      };
      const config = { ...defaultConfig, ...customConfig };

      gsap.set(this.DOM.el, { opacity: 1 });
      gsap.fromTo(
        this.cells.flat().map((cell) => cell.DOM.el),
        {
          scale: 0,
          opacity: 0,
          transformOrigin: config.transformOrigin,
        },
        {
          ...config,
          scale: 1.03,
          opacity: 1,
          onComplete: resolve,
        }
      );
    });
  }

  hide(customConfig: Partial<gsap.TweenVars> = {}): Promise<void> {
    return new Promise((resolve) => {
      const defaultConfig: gsap.TweenVars = {
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "none",
        stagger: {
          grid: [this.options.rows, this.options.columns],
          from: 0,
          each: 0.05,
        },
      };
      const config = { ...defaultConfig, ...customConfig };

      gsap.fromTo(
        this.cells.flat().map((cell) => cell.DOM.el),
        {
          transformOrigin: config.transformOrigin,
        },
        {
          ...config,
          scale: 0,
          opacity: 0,
          onComplete: resolve,
        }
      );
    });
  }
}
