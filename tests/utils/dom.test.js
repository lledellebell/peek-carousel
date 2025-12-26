import { describe, it, expect, beforeEach } from 'vitest';
import {
  getElement,
  getElements,
  addClass,
  removeClass,
  toggleClass,
  setStyle,
  setCSSVar,
  setAttribute,
  removeAttribute,
} from '../../src/utils/dom.js';

describe('dom', () => {
  let testElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    testElement.className = 'initial-class';
    document.body.appendChild(testElement);
  });

  describe('getElement', () => {
    it('문자열 셀렉터로 엘리먼트를 찾아야 함', () => {
      const element = getElement('#test-element');

      expect(element).toBe(testElement);
    });

    it('HTMLElement를 그대로 반환해야 함', () => {
      const element = getElement(testElement);

      expect(element).toBe(testElement);
    });

    it('존재하지 않는 셀렉터에 null을 반환해야 함', () => {
      const element = getElement('#nonexistent');

      expect(element).toBeNull();
    });

    it('유효하지 않은 입력에 null을 반환해야 함', () => {
      expect(getElement(123)).toBeNull();
      expect(getElement({})).toBeNull();
      expect(getElement(null)).toBeNull();
    });
  });

  describe('getElements', () => {
    beforeEach(() => {
      const item1 = document.createElement('div');
      item1.className = 'test-item';
      const item2 = document.createElement('div');
      item2.className = 'test-item';
      const item3 = document.createElement('div');
      item3.className = 'test-item';
      document.body.appendChild(item1);
      document.body.appendChild(item2);
      document.body.appendChild(item3);
    });

    it('셀렉터와 일치하는 모든 엘리먼트를 배열로 반환해야 함', () => {
      const elements = getElements('.test-item');

      expect(Array.isArray(elements)).toBe(true);
      expect(elements.length).toBe(3);
    });

    it('일치하는 엘리먼트가 없으면 빈 배열을 반환해야 함', () => {
      const elements = getElements('.nonexistent');

      expect(elements).toEqual([]);
    });

    it('parent 내에서만 검색해야 함', () => {
      const container = document.createElement('div');
      const child = document.createElement('div');
      child.className = 'child-item';
      container.appendChild(child);
      document.body.appendChild(container);

      const elements = getElements('.child-item', container);

      expect(elements.length).toBe(1);
      expect(elements[0]).toBe(child);
    });

    it('유효하지 않은 셀렉터에 빈 배열을 반환해야 함', () => {
      const elements = getElements(123);

      expect(elements).toEqual([]);
    });
  });

  describe('addClass', () => {
    it('단일 클래스를 추가해야 함', () => {
      addClass(testElement, 'new-class');

      expect(testElement.classList.contains('new-class')).toBe(true);
    });

    it('여러 클래스를 추가해야 함', () => {
      addClass(testElement, 'class1', 'class2', 'class3');

      expect(testElement.classList.contains('class1')).toBe(true);
      expect(testElement.classList.contains('class2')).toBe(true);
      expect(testElement.classList.contains('class3')).toBe(true);
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => addClass(null, 'class')).not.toThrow();
      expect(() => addClass('not-element', 'class')).not.toThrow();
    });

    it('클래스가 없으면 아무 작업도 하지 않아야 함', () => {
      const originalClassList = testElement.className;

      addClass(testElement);

      expect(testElement.className).toBe(originalClassList);
    });
  });

  describe('removeClass', () => {
    beforeEach(() => {
      testElement.className = 'class1 class2 class3';
    });

    it('단일 클래스를 제거해야 함', () => {
      removeClass(testElement, 'class1');

      expect(testElement.classList.contains('class1')).toBe(false);
      expect(testElement.classList.contains('class2')).toBe(true);
    });

    it('여러 클래스를 제거해야 함', () => {
      removeClass(testElement, 'class1', 'class2');

      expect(testElement.classList.contains('class1')).toBe(false);
      expect(testElement.classList.contains('class2')).toBe(false);
      expect(testElement.classList.contains('class3')).toBe(true);
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => removeClass(null, 'class')).not.toThrow();
    });
  });

  describe('toggleClass', () => {
    it('클래스가 없으면 추가해야 함', () => {
      toggleClass(testElement, 'toggle-class');

      expect(testElement.classList.contains('toggle-class')).toBe(true);
    });

    it('클래스가 있으면 제거해야 함', () => {
      testElement.classList.add('toggle-class');

      toggleClass(testElement, 'toggle-class');

      expect(testElement.classList.contains('toggle-class')).toBe(false);
    });

    it('force 매개변수로 강제 추가해야 함', () => {
      toggleClass(testElement, 'force-class', true);

      expect(testElement.classList.contains('force-class')).toBe(true);

      toggleClass(testElement, 'force-class', true);

      expect(testElement.classList.contains('force-class')).toBe(true);
    });

    it('force 매개변수로 강제 제거해야 함', () => {
      testElement.classList.add('force-class');

      toggleClass(testElement, 'force-class', false);

      expect(testElement.classList.contains('force-class')).toBe(false);
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => toggleClass(null, 'class')).not.toThrow();
    });
  });

  describe('setStyle', () => {
    it('스타일 속성을 설정해야 함', () => {
      setStyle(testElement, 'color', 'red');

      expect(testElement.style.color).toBe('red');
    });

    it('여러 스타일 속성을 설정할 수 있어야 함', () => {
      setStyle(testElement, 'width', '100px');
      setStyle(testElement, 'height', '200px');

      expect(testElement.style.width).toBe('100px');
      expect(testElement.style.height).toBe('200px');
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => setStyle(null, 'color', 'red')).not.toThrow();
    });

    it('속성이 없으면 아무 작업도 하지 않아야 함', () => {
      expect(() => setStyle(testElement, '', 'value')).not.toThrow();
    });
  });

  describe('setCSSVar', () => {
    it('CSS 변수를 설정해야 함', () => {
      setCSSVar(testElement, '--test-var', '10px');

      expect(testElement.style.getPropertyValue('--test-var')).toBe('10px');
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => setCSSVar(null, '--var', 'value')).not.toThrow();
    });
  });

  describe('setAttribute', () => {
    it('속성을 설정해야 함', () => {
      setAttribute(testElement, 'data-value', 'test');

      expect(testElement.getAttribute('data-value')).toBe('test');
    });

    it('aria 속성을 설정해야 함', () => {
      setAttribute(testElement, 'aria-label', 'Test Label');

      expect(testElement.getAttribute('aria-label')).toBe('Test Label');
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => setAttribute(null, 'attr', 'value')).not.toThrow();
    });

    it('속성 이름이 없으면 아무 작업도 하지 않아야 함', () => {
      expect(() => setAttribute(testElement, '', 'value')).not.toThrow();
    });
  });

  describe('removeAttribute', () => {
    beforeEach(() => {
      testElement.setAttribute('data-test', 'value');
    });

    it('속성을 제거해야 함', () => {
      removeAttribute(testElement, 'data-test');

      expect(testElement.hasAttribute('data-test')).toBe(false);
    });

    it('유효하지 않은 엘리먼트에 에러를 발생시키지 않아야 함', () => {
      expect(() => removeAttribute(null, 'attr')).not.toThrow();
    });

    it('존재하지 않는 속성 제거 시 에러를 발생시키지 않아야 함', () => {
      expect(() => removeAttribute(testElement, 'nonexistent')).not.toThrow();
    });
  });
});
