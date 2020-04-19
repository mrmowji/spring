import { config } from "./config.js";
import { util } from "./util.js";

function Spring(options) {
  this.p = options.p;
  this.image = options.image;
  this.restLocation = { y: options.y };
  this.location = {
    x: options.x,
    y: options.y,
  };
  this.hit = false;
  this.hitTheTop = false;
  this.isHitOver = true;
  this.width = this.image.width;
  this.height = this.image.height;
  this.initialWidth = this.width;
  this.initialHeight = this.height;
  this.minHeight = 25;
  this.maxHeight = 75;
  this.coordinateSystemX = 0;

  // spring simulation constants
  this.mass = 0.8;
  this.constant = 0.2;
  this.d = 0.92; // Damping

  // spring simulation variables
  this.velocity = 0.0;
  this.acceleration = 0;
  this.force = 0;

  this.isOut = (coordinateSystemX) => {
    this.coordinateSystemX = coordinateSystemX;
    return (
      !this.hit &&
      config.canvasWidth / 2 +
        this.location.x +
        this.width -
        this.coordinateSystemX +
        20 <
        0
    );
  };

  this.update = (coordinateSystemX, xLowerBound, regenerate) => {
    this.coordinateSystemX = coordinateSystemX;
    if (!this.hit) {
      this.force = -this.constant * (this.location.y - this.restLocation.y);
      this.acceleration = this.force / this.mass;
      this.velocity = this.d * (this.velocity + this.acceleration);
      this.location.y = this.location.y + this.velocity;
    }

    if (Math.abs(this.velocity) < 0.1) {
      this.velocity = 0.0;
    }

    if (this.hit) {
      this.location.y = this.restLocation.y + 10;
      if (
        this.location.y >
        this.restLocation.y + this.initialHeight - this.minHeight
      ) {
        this.location.y =
          this.restLocation.y + this.initialHeight - this.minHeight;
      }
      if (
        this.location.y <
        this.restLocation.y - (this.maxHeight - this.initialHeight)
      ) {
        this.location.y =
          this.restLocation.y - (this.maxHeight - this.initialHeight);
      }
    }

    if (this.location.y > this.restLocation.y) {
      this.height = this.restLocation.y + this.initialHeight - this.location.y;
    }
    if (this.location.y < this.restLocation.y) {
      this.height = this.restLocation.y - this.location.y + this.initialHeight;
    }
    let deltaWidth = this.width - (1 * 5000) / this.height;
    this.width -= deltaWidth;
    if (deltaWidth < 0) {
      this.location.x = this.location.x - -deltaWidth / 2;
    } else {
      this.location.x = this.location.x + deltaWidth / 2;
    }

    if (this.isOut(coordinateSystemX) && regenerate) {
      this.location.x = util.generateRandomInteger(
        xLowerBound + this.width + config.minimumSpringsDistance,
        xLowerBound + this.width + config.maximumSpringsDistance
      );
      this.location.y = util.generateRandomInteger(
        config.canvasHeight - 300,
        config.canvasHeight - 100
      );
      this.restLocation.y = this.location.y;
      this.hit = false;
      this.width = this.initialWidth;
      this.height = this.initialHeight;
    }

    if (
      !regenerate &&
      (config.canvasWidth / 2 +
        this.location.x -
        this.coordinateSystemX
       > config.canvasWidth
        )
    ) {
      this.location.x = -config.canvasWidth - this.width;
    }
  };

  this.draw = () => {
    this.p.image(
      this.image,
      config.canvasWidth / 2 + this.location.x - this.coordinateSystemX,
      this.location.y,
      this.width,
      this.height
    );
  };

  this.checkHit = (otherObject) => {
    if (
      otherObject.location.y + otherObject.height >= this.location.y &&
      otherObject.location.y < this.location.y + this.height &&
      otherObject.location.x >= this.location.x &&
      otherObject.location.x <= this.location.x + this.width
    ) {
      let collisionX =
        otherObject.previousLocation.x +
        ((otherObject.location.x - otherObject.previousLocation.x) *
          (this.location.y -
            otherObject.previousLocation.y -
            otherObject.width / 2)) /
          (otherObject.location.y - otherObject.previousLocation.y);
      if (!this.hitTheTop) {
        this.hitTheTop = Boolean(
          collisionX >= this.location.x &&
            collisionX <= this.location.x + this.width
        );
      }
      if (
        otherObject.velocity.y >= 0 &&
        ((otherObject.location.y + otherObject.height / 2 - 15 >
          this.location.y &&
          this.hitTheTop) ||
          (otherObject.velocity.y === 0 &&
            otherObject.location.y + otherObject.height / 2 >
              this.location.y)) &&
        otherObject.location.y < this.location.y + this.initialHeight
      ) {
        this.hitTheTop = false;
        if (otherObject.velocity.y === 0) {
          if (this.p.keyIsPressed || this.p.mouseIsPressed) {
            this.hit = true;
            return true;
          }
        } else {
          this.hit = true;
          return true;
        }
      } else {
        this.hit = false;
        this.hitTheTop = false;
      }
    } else {
      this.hit = false;
      this.hitTheTop = false;
    }
    return false;
  };
}

export { Spring };
