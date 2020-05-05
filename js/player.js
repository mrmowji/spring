import { config } from "./config.js";

function Player(options) {
  this.p = options.p;
  this.image = options.image;
  this.jumpSound = options.jumpSound;
  this.catchClockSound = options.catchClockSound;
  this.acceleration = { x: 0, y: 9.8 * config.pixelsPerMeter };
  this.velocity = { x: 0, y: 0 };
  this.width = this.image.width;
  this.height = this.image.height;
  this.location = {
    x: 0,
    y: config.canvasHeight - 150 - this.width / 2 + 3,
  };
  this.previousLocation = {
    x: this.location.x,
    y: this.location.y,
  };
  this.isResting = true;
  this.locationOffsetX = 0;
  this.numberOfPassedPixels = 0;

  this.update = () => {
    this.updateAcceleration();
    this.updateLocation();
    this.updateVelocity();
  };

  this.updateAcceleration = () => {
    let isRightPressed =
      (this.p.mouseIsPressed && this.p.mouseX > config.canvasWidth / 2) ||
      (this.p.keyIsPressed && this.p.keyCode === this.p.RIGHT_ARROW);
    let isLeftPressed =
      (this.p.mouseIsPressed && this.p.mouseX < config.canvasWidth / 2) ||
      (this.p.keyIsPressed && this.p.keyCode === this.p.LEFT_ARROW);
    if (isRightPressed) {
      this.acceleration.x = 10 * config.pixelsPerMeter;
    } else if (isLeftPressed) {
      this.acceleration.x = -10 * config.pixelsPerMeter;
    } else {
      if (this.velocity.x > 0) {
        this.acceleration.x = -100;
      } else if (this.velocity.x < 0) {
        this.acceleration.x = 100;
      } else {
        this.acceleration.x = 0;
      }
    }
  };

  this.updateLocation = () => {
    this.previousLocation.x = this.location.x;
    this.previousLocation.y = this.location.y;
    let deltaLocation = {
      x:
        0.5 * this.acceleration.x * config.framesTimeInterval ** 2 +
        this.velocity.x * config.framesTimeInterval,
      y:
        0.5 * this.acceleration.y * config.framesTimeInterval ** 2 +
        this.velocity.y * config.framesTimeInterval,
    };
    if (deltaLocation.x + this.location.x <= this.numberOfPassedPixels) {
      this.location.x += deltaLocation.x;
      this.location.y += deltaLocation.y;
      this.locationOffsetX = 0;
    } else {
      this.location.x += deltaLocation.x;
      this.location.y += deltaLocation.y;
      this.locationOffsetX = deltaLocation.x;
      this.numberOfPassedPixels +=
        this.locationOffsetX > 0 ? this.locationOffsetX : 0;
    }
  };

  this.updateVelocity = () => {
    this.velocity.x =
      this.velocity.x + this.acceleration.x * config.framesTimeInterval;
    this.velocity.y =
      this.velocity.y + this.acceleration.y * config.framesTimeInterval;
    if (Math.abs(this.velocity.x) > 4 * config.pixelsPerMeter) {
      this.velocity.x =
        (this.velocity.x < 0 ? -1 : 1) * 4 * config.pixelsPerMeter;
    }
  };

  this.isOut = () => {
    return (this.location.y + this.height - 200 > config.canvasHeight);
  };

  this.jump = () => {
    this.velocity.y = -Math.sqrt(
      2 * this.acceleration.y * (this.location.y - 150)
    );
    this.isResting = false;
    this.jumpSound.play();
  };

  this.catchClock = function () {
    this.catchClockSound.play();
  };

  this.draw = () => {
    this.p.image(
      this.image,
      config.canvasWidth / 2 +
        (this.location.x - this.numberOfPassedPixels) -
        this.width / 2,
      this.location.y - this.height / 2
    );
  };
}

export { Player };
