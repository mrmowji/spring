"use strict";

// game constants
const canvasWidth = document.body.clientWidth;
const canvasHeight = document.body.clientHeight;
const framesPerSecond = 60;
const framesTimeInterval = 1 / framesPerSecond;
let pixelsPerMeter = 100;
let coordinateSystemCenterX = 0;
let numberOfPassedPixels = 0;
let interval;
let seconds = 30;
let numberOfClouds = 5;

// player variables
let playerAcceleration = { x: 0, y: 9.8 * pixelsPerMeter };
let playerVelocity = { x: 0, y: 0 };
let playerWidth = 60;
let playerHeight = 60;
let playerLocation = {
  x: 0,
  y: canvasHeight - 150 - playerWidth / 2 + 3,
};
let playerPreviousLocation = {
  x: playerLocation.x,
  y: playerLocation.y,
};
let playerResting = true;
let playerLocationOffsetX = 0;

let cloudImages = [];
let playerImage;
let springImage;
let clockImage;
let clockWidth;
let clockHeight;
let clockVelocity = 3;

let springs = [];
let clouds = [];
let jumpSound;
let catchClockSound;
let clockGenerated = false;
let clockLocation = { x: 0, y: 0 };

// this is global namespace mode
// you can use instance mode:
// let app = new p5(function (p) { p.setup = function() ... });
function preload() {
  for (let i = 1; i <= 11; i++) {
    cloudImages.push(loadImage(`images/cloud-${i < 10 ? "0" + i : i}.svg`));
  }
  playerImage = loadImage("images/player.svg");
  springImage = loadImage("images/spring.svg");
  clockImage = loadImage("images/clock.svg");
  jumpSound = loadSound("sounds/jump.mp3");
  catchClockSound = loadSound("sounds/catch-clock-2.mp3");
}

function setup() {
  clockWidth = clockImage.width;
  clockHeight = clockImage.height;
  createCanvas(canvasWidth, canvasHeight);
  generateClouds();
  generateSprings();
  updateClockLocation();
  drawBackground();
  drawClouds();
  drawPlayer();
  drawSprings();
  drawScore();
  drawTime();
}

function draw() {
  frameRate(framesPerSecond);
  drawBackground();
  drawClouds();
  if (!playerResting) {
    updatePlayerAcceleration();
    updatePlayerVelocity();
    updatePlayerLocation();
  }
  updateClouds();
  generateSprings();
  checkSpringsHit();
  updateSprings();
  drawPlayer();
  drawSprings();
  drawScore();
  drawTime();
}

function start() {
  interval = setInterval(function () {
    seconds--;
    if (seconds === 0) {
      clearInterval(interval);
      clockLocation.x = -canvasWidth;
    }
  }, 1000);
}

function generateClouds() {
  for (let i = 0; i < numberOfClouds; i++) {
    clouds.push({
      imageIndex: generateRandomInteger(0, cloudImages.length - 1),
      x: generateRandomInteger(-canvasWidth / 2, canvasWidth),
      y: generateRandomInteger(0, canvasHeight),
    });
  }
}

function updateClouds() {
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x--;
    if (
      canvasWidth / 2 + clouds[i].x - numberOfPassedPixels <
      -cloudImages[clouds[i].imageIndex].width - 10
    ) {
      clouds[i].imageIndex = generateRandomInteger(0, cloudImages.length - 1);
      clouds[i].x = generateRandomInteger(
        numberOfPassedPixels + canvasWidth,
        numberOfPassedPixels + canvasWidth * 2
      );
      clouds[i].y = generateRandomInteger(0, canvasHeight);
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
  this.hitTheTop = false;
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
    image(
      springImage,
      canvasWidth / 2 + (this.location.x - numberOfPassedPixels),
      this.location.y,
      this.width,
      this.height
    );
  };

  this.checkHit = function () {
    if (
      playerLocation.y + playerHeight >= this.location.y &&
      playerLocation.y < this.location.y + this.height &&
      playerLocation.x >= this.location.x &&
      playerLocation.x <= this.location.x + this.width
    ) {
      let collisionX =
        playerPreviousLocation.x +
        ((playerLocation.x - playerPreviousLocation.x) *
          (this.location.y - playerPreviousLocation.y - playerWidth / 2)) /
          (playerLocation.y - playerPreviousLocation.y);
      if (!this.hitTheTop) {
        this.hitTheTop = Boolean(
          collisionX >= this.location.x &&
            collisionX <= this.location.x + this.width
        );
      }
      if (
        playerVelocity.y >= 0 &&
        ((playerLocation.y + playerHeight / 2 - 15 > this.location.y &&
          this.hitTheTop) ||
          (playerVelocity.y === 0 &&
            playerLocation.y + playerHeight / 2 > this.location.y)) &&
        playerLocation.y < this.location.y + this.initialHeight
      ) {
        this.hitTheTop = false;
        if (playerVelocity.y === 0) {
          if (keyIsPressed || mouseIsPressed) {
            playerVelocity.y = -Math.sqrt(
              2 * playerAcceleration.y * (this.location.y - 150)
            );
            playerResting = false;
            jumpSound.play();
            start();
            this.hit = true;
          }
        } else {
          playerVelocity.y = -Math.sqrt(
            2 * playerAcceleration.y * (playerLocation.y - 150)
          );
          this.hit = true;
          jumpSound.play();
        }
      } else {
        this.hit = false;
        this.hitTheTop = false;
      }
    } else {
      this.hit = false;
      this.hitTheTop = false;
    }
  };
}

function generateSprings() {
  if (springs.length === 0) {
    springs.push(new Spring(-50, canvasHeight - 150));
  } else if (seconds > 0) {
    while (
      springs[springs.length - 1].location.x +
        springs[springs.length - 1].width <
      canvasWidth + numberOfPassedPixels
    ) {
      let x = generateRandomInteger(
        springs[springs.length - 1].location.x + 200,
        springs[springs.length - 1].location.x + 400
      );
      let y = generateRandomInteger(canvasHeight - 300, canvasHeight - 100);
      springs.push(new Spring(x, y));
    }
  } else {
    for (let i = 0; i < springs.length; i++) {
      if (
        canvasWidth / 2 + springs[i].location.x - numberOfPassedPixels >
        canvasWidth
      ) {
        springs.splice(i, 1);
      }
    }
  }
}

function drawBackground() {
  background(111, 197, 206);
}

function drawClouds() {
  for (let i = 0; i < clouds.length; i++) {
    image(
      cloudImages[clouds[i].imageIndex],
      canvasWidth / 2 + (clouds[i].x - numberOfPassedPixels),
      clouds[i].y
    );
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
    if (playerVelocity.x > 0) {
      playerAcceleration.x = -100;
    } else if (playerVelocity.x < 0) {
      playerAcceleration.x = 100;
    } else {
      playerAcceleration.x = 0;
    }
  }
}

function updatePlayerLocation() {
  playerPreviousLocation.x = playerLocation.x;
  playerPreviousLocation.y = playerLocation.y;
  let deltaLocation = {
    x:
      0.5 * playerAcceleration.x * framesTimeInterval ** 2 +
      playerVelocity.x * framesTimeInterval,
    y:
      0.5 * playerAcceleration.y * framesTimeInterval ** 2 +
      playerVelocity.y * framesTimeInterval,
  };
  if (deltaLocation.x + playerLocation.x <= numberOfPassedPixels) {
    playerLocation.x += deltaLocation.x;
    playerLocation.y += deltaLocation.y;
    playerLocationOffsetX = 0;
  } else {
    playerLocation.x += deltaLocation.x;
    playerLocation.y += deltaLocation.y;
    playerLocationOffsetX = deltaLocation.x;
    numberOfPassedPixels +=
      playerLocationOffsetX > 0 ? playerLocationOffsetX : 0;
  }
  if (playerLocation.x + canvasWidth / 2 > clockLocation.x) {
    if (
      clockLocation.x <= playerLocation.x + playerWidth &&
      clockLocation.x >= playerLocation.x - playerWidth &&
      clockLocation.y <= playerLocation.y + playerHeight &&
      clockLocation.y >= playerLocation.y - playerHeight
    ) {
      catchClockSound.play();
      seconds += 30;
      updateClockLocation();
    }
    drawClock();
    if (playerLocation.x > clockLocation.x + canvasWidth) {
      updateClockLocation();
    }
  }
  if (playerLocation.y + playerHeight - 1000 > canvasHeight) {
    noLoop();
  }
}

function drawClock() {
  image(
    clockImage,
    canvasWidth / 2 + (clockLocation.x - numberOfPassedPixels) - clockWidth / 2,
    clockLocation.y - clockHeight / 2
  );
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
  image(
    playerImage,
    canvasWidth / 2 +
      (playerLocation.x - numberOfPassedPixels) -
      playerWidth / 2,
    playerLocation.y - playerHeight / 2
  );
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

function drawScore() {
  noStroke();
  fill(0, 0, 0, 80);
  rect(canvasWidth - 100, 20, 80, 40, 10);
  fill(255, 255, 255);
  textFont("Ubuntu", 25);
  textAlign(CENTER, CENTER);
  text(
    Math.floor(numberOfPassedPixels / pixelsPerMeter) + "m",
    canvasWidth - 60,
    40
  );
}

function drawTime() {
  noStroke();
  fill(0, 0, 0, 80);
  rect(canvasWidth - 200, 20, 80, 40, 10);
  fill(255, 255, 255);
  textFont("Ubuntu", 25);
  textAlign(CENTER, CENTER);
  text(seconds + "s", canvasWidth - 160, 40);
}

function checkSpringsHit() {
  for (let spring of springs) {
    spring.checkHit();
  }
}

function updateClockLocation() {
  clockLocation.x = generateRandomInteger(clockLocation.x + canvasWidth, clockLocation.x + canvasWidth + 2000);
  clockLocation.y = generateRandomInteger(150, 300);
}

function generateRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
