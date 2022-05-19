import NormalizeWheel from "normalize-wheel";

import each from "lodash/each";

import Canvas from "./components/Canvas";
import Home from "./pages/Home";

import "../styles/index.scss";

class App {
  constructor() {
    this.url = window.location.pathname;

    this.createCanvas();
    // this.createPreloader();
    // this.createNavigation();
    this.createPages();

    this.addEventListeners();
    this.addLinkListeners();

    this.onResize();

    this.update();
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template,
    });
  }

  createPreloader() {
    this.preloader = new Preloader({
      canvas: this.canvas,
    });

    this.preloader.once("completed", this.onPreloaded.bind(this));
  }

  createCanvas() {
    this.canvas = new Canvas({
      url: this.url,
    });
  }

  createPages() {
    this.pages = {
      "/": new Home(),
    };

    this.page = this.pages[this.url];
    this.page.create();
  }

  /*
   * Events
   */

  onPreloaded() {
    this.onResize();

    this.canvas.onPreloaded();

    this.page.show();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: true,
    });
  }

  async onChange({ url, push = true }) {
    this.canvas.onChangeStart(this.template, url);

    await this.page.hide();

    const res = await window.fetch(url);
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }

    window.requestAnimationFrame((_) => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }

  onTouchDown(e) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(e);
    }
  }

  onTouchMove(e) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(e);
    }
  }

  onTouchUp(e) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(e);
    }
  }

  onWheel(e) {
    const normalizedWheel = NormalizeWheel(e);

    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel(normalizedWheel);
    }

    if (this.page && this.page.onWheel) {
      this.page.onWheel(normalizedWheel);
    }
  }

  /*
   *  LOop
   */

  update() {
    if (this.page && this.page.update) {
      this.page.update();
    }

    if (this.canvas && this.canvas.update) {
      this.canvas.update(this.page.scroll);
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this));
  }

  /*
   * Listeners
   */

  addEventListeners() {
    window.addEventListener("mousewheel", this.onWheel.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));

    window.addEventListener("resize", this.onResize.bind(this));
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    each(links, (link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;
        this.onChange({ url: href });
      };
    });
  }
}

new App();
