"use strict";

// game constants
const canvasWidth = document.body.clientWidth;
const canvasHeight = document.body.clientHeight;
const framesPerSecond = 60;
const framesTimeInterval = 1 / framesPerSecond;
let pixelsPerMeter = 100;

// game assets
let cloudImages = [];

// player variables
let playerAcceleration = { x: 0, y: 9.8 * pixelsPerMeter };
let playerVelocity = { x: 0, y: 0 };
let playerLocation = { x: canvasWidth / 2, y: 60 };
let playerWidth = 60;
let playerHeight = 60;

let springs = [];
let clouds = [];

// this is global namespace mode
// you can use instance mode:
// let app = new p5(function (p) { p.setup = function() ... });
function preload() {
  // load static assets here
  // just the loadings, not assignments
  for (let i = 1; i <= 11; i++) {
    cloudImages.push(loadImage(`images/cloud-${i < 10 ? "0" + i : i}.svg`));
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  generateClouds();
  generateSprings();
  drawBackground();
  drawPlayer();
  doByInterval(); // must be after the game is started
}

function draw() {
  drawBackground();
  frameRate(framesPerSecond);
  updatePlayerAcceleration();
  updatePlayerLocation();
  updatePlayerVelocity();
  updateClouds();
  drawPlayer();
  generateSprings();
  checkSpringsHit();
  updateSprings();
  drawSprings();
}

function doByInterval() {
  setInterval(function () {
    clouds.push({
      imageIndex: Math.floor(random() * cloudImages.length),
      x: random() * canvasWidth + canvasWidth,
      y: random() * canvasHeight,
      distance: random() * 10,
    });
  }, 5000);
}

function generateClouds() {
  for (let i = 0; i < random() * 5; i++) {
    clouds.push({
      imageIndex: Math.floor(random() * cloudImages.length),
      x: Math.floor(random() * canvasWidth),
      y: Math.floor(random() * canvasHeight),
      distance: random() * 10,
    });
  }
}

function updateClouds() {
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x--;
  }
  for (let i = clouds.length - 1; i >= 0; i--) {
    if (clouds[i].x < -cloudImages[clouds[i].imageIndex].width - 10) {
      clouds.splice(i, 1);
    }
  }
}

function Spring(x, y, width = 100) {
  this.restLocation = { y: y };
  this.location = {
    x: x,
    y: y,
  };
  this.hit = false;
  this.isHitOver = true;
  this.width = width;
  this.height = 50;
  this.initialHeight = this.height;
  this.minHeight = 25;
  this.maxHeight = 75;

  // spring simulation constants
  this.mass = 0.8;
  this.constant = 0.2;
  this.d = 0.92; // Damping

  // spring simulation variables
  this.velocity = 0.0;
  this.acceleration = 0;
  this.force = 0;

  this.update = function () {
    if (!this.hit) {
      this.force = -this.constant * (this.location.y - this.restLocation.y);
      this.acceleration = this.force / this.mass;
      this.velocity = this.d * (this.velocity + this.acceleration);
      this.location.y = this.location.y + this.velocity;
    }

    if (abs(this.velocity) < 0.1) {
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
  };

  this.draw = function () {
    fill(227, 64, 0);
    rect(this.location.x, this.location.y, this.width, this.height, 20);
  };

  this.checkHit = function () {
    if (
      playerLocation.y + playerHeight / 2 - 15 > this.location.y &&
      playerLocation.y < this.location.y + this.initialHeight &&
      playerLocation.x >= this.location.x &&
      playerLocation.x <= this.location.x + this.width
    ) {
      playerVelocity.y *= -1;
      this.hit = true;
      if (this.isHitOver)
      this.isHitOver = false;
    } else {
      this.hit = false;
      this.isHitOver = true;
    }
  };
}

function generateSprings() {
  if (springs.length === 0) {
    springs.push(new Spring((canvasWidth - 100) / 2, canvasHeight - 50 - 200));
  } else {
    while (
      springs[springs.length - 1].location.x +
        springs[springs.length - 1].width <
      canvasWidth
    ) {
      let x = generateRandomInteger(
        springs[springs.length - 1].location.x + 200,
        springs[springs.length - 1].location.x + 400
      );
      let y = generateRandomInteger(canvasHeight - 300, canvasHeight - 100);
      springs.push(new Spring(x, y));
    }
  }
}

function drawBackground() {
  background(111, 197, 206);
  for (let i = 0; i < clouds.length; i++) {
    image(cloudImages[clouds[i].imageIndex], clouds[i].x, clouds[i].y);
  }
}

function updatePlayerAcceleration() {
  let isRightPressed =
    (mouseIsPressed && mouseX > canvasWidth / 2) ||
    (keyIsPressed && keyCode === RIGHT_ARROW);
  let isLeftPressed =
    (mouseIsPressed && mouseX < canvasWidth / 2) ||
    (keyIsPressed && keyCode === LEFT_ARROW);
  if (isRightPressed) {
    playerAcceleration.x = 10 * pixelsPerMeter;
  } else if (isLeftPressed) {
    playerAcceleration.x = -10 * pixelsPerMeter;
  } else {
    playerAcceleration.x = 0;
  }
}

function updatePlayerLocation() {
  let deltaLocation = {
    x:
      0.5 * playerAcceleration.x * framesTimeInterval ** 2 +
      playerVelocity.x * framesTimeInterval,
    y:
      0.5 * playerAcceleration.y * framesTimeInterval ** 2 +
      playerVelocity.y * framesTimeInterval,
  };
  if (deltaLocation.x + playerLocation.x <= canvasWidth / 2) {
    playerLocation = {
      x: deltaLocation.x + playerLocation.x,
      y: deltaLocation.y + playerLocation.y,
    };
  } else {
    playerLocation.y += deltaLocation.y;
    for (let spring of springs) {
      spring.location.x += -deltaLocation.x;
    }
  }
  if (playerLocation.y + playerHeight - 1000 > canvasHeight) {
    noLoop();
  }
}

function updatePlayerVelocity() {
  playerVelocity = {
    x: playerVelocity.x + playerAcceleration.x * framesTimeInterval,
    y: playerVelocity.y + playerAcceleration.y * framesTimeInterval,
  };
  if (Math.abs(playerVelocity.x) > 4 * pixelsPerMeter) {
    playerVelocity.x = (playerVelocity.x < 0 ? -1 : 1) * 4 * pixelsPerMeter;
  }
}

function drawPlayer() {
  strokeWeight(5);
  stroke(86, 49, 74);
  fill(242, 179, 24);
  ellipse(playerLocation.x, playerLocation.y, playerWidth, playerHeight);
}

function updateSprings() {
  for (let spring of springs) {
    spring.update();
  }
}

function drawSprings() {
  for (let spring of springs) {
    spring.draw();
  }
}

function checkSpringsHit() {
  for (let spring of springs) {
    spring.checkHit();
  }
}

function generateRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
