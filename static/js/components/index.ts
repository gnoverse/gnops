import { Tabs } from "./tabs";
import { Search } from "./search";
import { List } from "./list";
import { ArticleContent } from "./articlecontent";
import { Stage } from "./stage";

interface Component {
  [x: string]: any;
  destroy: () => void;
}

const componentRegistry: Record<string, new (element: HTMLElement) => Component> = {
  tabs: Tabs,
  search: Search,
  list: List,
  article: ArticleContent,
  stage: Stage,
};

let activeInstances: Component[] = [];

function initComponents(scope = document.body): void {
  const elements = scope.querySelectorAll<HTMLElement>("[data-component]");

  elements.forEach((element) => {
    const componentName = element.dataset.component;

    if (componentName && componentRegistry[componentName]) {
      const ComponentClass = componentRegistry[componentName];
      const instance = new ComponentClass(element);
      activeInstances.push(instance);
    } else {
      console.warn(`Component "${componentName}" is not registered.`);
    }
  });
}

function destroyComponents(scope: HTMLElement): void {
  activeInstances = activeInstances.filter((component) => {
    if (scope.contains(component.DOM.el)) {
      if (typeof component.destroy === "function") {
        component.destroy();
      }
      return false;
    }
    return true;
  });
}

export { initComponents, destroyComponents };
