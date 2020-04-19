import { config } from "./config.js";
import { util } from "./util.js";

function Clock(options) {
  this.p = options.p;
  this.image = options.image;
  this.width = this.image.width;
  this.height = this.image.height;
  this.location = {
    x: -config.canvasWidth,
    y: 0,
  };
  this.velocity = {
    x: -3,
    y: 0,
  };
  this.coordinateSystemX = 0;
  this.hit = false;

  this.hide = () => {
    this.location.x = -config.canvasWidth;
  };

  this.checkHit = (otherObject) => {
    if (
      this.location.x <= otherObject.location.x + otherObject.width &&
      this.location.x >= otherObject.location.x - otherObject.width &&
      this.location.y <= otherObject.location.y + otherObject.height &&
      this.location.y >= otherObject.location.y - otherObject.height
    ) {
      this.hit = true;
      return true;
    }
  };

  this.update = (coordinateSystemX) => {
    this.coordinateSystemX = coordinateSystemX;
    if (
      config.canvasWidth / 2 +
        this.location.x +
        this.width -
        this.coordinateSystemX <
      0 || this.hit
    ) {
      this.location.x = util.generateRandomInteger(
        this.location.x + config.canvasWidth,
        this.location.x + config.canvasWidth + 2000
      );
      this.location.y = util.generateRandomInteger(150, 300);
      this.hit = false;
    }
  };

  this.draw = () => {
    this.p.image(
      this.image,
      config.canvasWidth / 2 +
        (this.location.x - this.coordinateSystemX) -
        this.width / 2,
      this.location.y - this.height / 2
    );
  };

  this.update(0);
}

export { Clock };
