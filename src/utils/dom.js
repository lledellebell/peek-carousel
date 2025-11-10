export function getElement(selector) {
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  }
  return selector instanceof HTMLElement ? selector : null;
}

export function getElements(selector, parent = document) {
  if (typeof selector !== 'string') return [];
  return Array.from(parent.querySelectorAll(selector));
}

export function addClass(element, ...classes) {
  if (element instanceof HTMLElement && classes.length > 0) {
    element.classList.add(...classes);
  }
}

export function removeClass(element, ...classes) {
  if (element instanceof HTMLElement && classes.length > 0) {
    element.classList.remove(...classes);
  }
}

export function toggleClass(element, className, force) {
  if (element instanceof HTMLElement && className) {
    element.classList.toggle(className, force);
  }
}

export function setStyle(element, property, value) {
  if (element instanceof HTMLElement && property) {
    element.style[property] = value;
  }
}

export function setCSSVar(element, property, value) {
  if (element instanceof HTMLElement && property) {
    element.style.setProperty(property, value);
  }
}

export function setAttribute(element, name, value) {
  if (element instanceof HTMLElement && name) {
    element.setAttribute(name, value);
  }
}

export function removeAttribute(element, name) {
  if (element instanceof HTMLElement && name) {
    element.removeAttribute(name);
  }
}
