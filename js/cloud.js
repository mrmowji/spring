import { config } from "./config.js";
import { util } from "./util.js";

function Cloud(options) {
  this.p = options.p;
  this.image = options.image;
  this.images = options.images;
  this.imageIndex = util.generateRandomInteger(0, this.images.length - 1);
  this.location = {
    x: util.generateRandomInteger(-config.canvasWidth / 2, config.canvasWidth),
    y: util.generateRandomInteger(0, config.canvasHeight),
  };
  this.coordinateSystemX = 0;

  this.update = (coordinateSystemX) => {
    this.coordinateSystemX = coordinateSystemX;
    this.location.x--;
    if (
      config.canvasWidth / 2 + this.location.x - this.coordinateSystemX <
      -this.images[this.imageIndex].width - 10
    ) {
      this.imageIndex = util.generateRandomInteger(0, this.images.length - 1);
      this.location.x = util.generateRandomInteger(
        this.coordinateSystemX + config.canvasWidth,
        this.coordinateSystemX + config.canvasWidth * 2
      );
      this.location.y = util.generateRandomInteger(0, config.canvasHeight);
    }
  };

  this.draw = () => {
    this.p.image(
      this.images[this.imageIndex],
      config.canvasWidth / 2 + (this.location.x - this.coordinateSystemX),
      this.location.y
    );
  };
}

export { Cloud };
