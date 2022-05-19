import { Texture, Program, Mesh } from "ogl";

import fragment from "../../shaders/fragment.glsl";
import vertex from "../../shaders/vertex.glsl";

import { lerp } from "../../utils/math";

export default class {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
  }) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.extra = 0;

    this.createShader();
    this.createMesh();

    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: false,
    });

    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
      },
      transparent: true,
    });

    const image = new Image();

    image.src = this.image;
    image.onload = (_) => {
      texture.image = image;

      this.program.uniforms.uImageSizes.value = [
        image.naturalWidth,
        image.naturalHeight,
      ];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.plane.setParent(this.scene);
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current * 0.1 - this.extra;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width;

    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;

      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;

      this.isBefore = false;
      this.isAfter = false;
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) {
      this.screen = screen;
    }

    if (viewport) {
      this.viewport = viewport;

      this.plane.program.uniforms.uViewportSizes.value = [
        this.viewport.width,
        this.viewport.height,
      ];
    }

    this.scale = this.screen.height / 1500;

    this.plane.scale.y =
      (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x =
      (this.viewport.width * (700 * this.scale)) / this.screen.width;

    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    this.padding = 2;

    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;

    this.x = this.width * this.index;
  }
}
