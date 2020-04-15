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

// spring constants
let springWidth = 100;
let springHeight = 50;
let springInitialHeight = springHeight;
let springMinHeight = 25;
let springMaxHeight = 75;

// spring simulation constants
let springMass = 0.8;
let springConstant = 0.2;
let D = 0.92; // Damping
let springRestLocation = { y: canvasHeight - springHeight - 200 };

// spring simulation variables
let springLocation = {
  x: (canvasWidth - springWidth) / 2,
  y: springRestLocation.y,
};
let springVelocity = 0.0;
let springAcceleration = 0;
let springForce = 0;
let move = false;

// this is global namespace mode
// you can use instance mode:
// let app = new p5(function (p) { p.setup = function() ... });
function preload() {
  // load static assets here
  // just the loadings, not assignments
  for (let i = 1; i <= 11; i++) {
    cloudImages.push(loadImage(`images/cloud-${(i < 10 ? "0" + i : i)}.svg`));
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  generateClouds();
  generateSprings();
  drawBackground();
  drawPlayer();
}

function draw() {
  drawBackground();
  frameRate(framesPerSecond);
  updatePlayerAcceleration();
  updatePlayerLocation();
  updatePlayerVelocity();
  updateClouds();
  drawPlayer();
  checkMove();
  updateSpring();
  drawSpring();
}

function generateClouds() {
  for (let i = 0; i < random() * 5; i++) {
    clouds.push({
      imageIndex: Math.floor(random() * cloudImages.length),
      x: random() * canvasWidth,
      y: random() * canvasHeight,
      distance: random() * 10,
    });
  }
}

function updateClouds() {
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].x--;
  }
  let numberOfDeleted = 0;
  for (let i = clouds.length - 1; i >= 0; i--) {
    if (clouds[i].x < (-cloudImages[clouds[i].imageIndex].width - 10)) {
      clouds.splice(i, 1);
      numberOfDeleted++;
    }
  }
  for (let i = 0; i < numberOfDeleted; i++) {
    clouds.push({
      imageIndex: Math.floor(random() * cloudImages.length),
      x: random() * canvasWidth + canvasWidth,
      y: random() * canvasHeight,
      distance: random() * 10,
    });
  }
}

function generateSprings() {

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
  }
}

function updatePlayerLocation() {
  let deltaLocation = {
    x:
      (0.5 * playerAcceleration.x * framesTimeInterval ** 2 +
      playerVelocity.x * framesTimeInterval),
    y:
      (0.5 * playerAcceleration.y * framesTimeInterval ** 2 +
      playerVelocity.y * framesTimeInterval),
  };
  playerLocation = {
    x: deltaLocation.x + playerLocation.x,
    y: deltaLocation.y + playerLocation.y,
  };
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

function updateSpring() {
  if (!move) {
    springForce = -springConstant * (springLocation.y - springRestLocation.y);
    springAcceleration = springForce / springMass;
    springVelocity = D * (springVelocity + springAcceleration);
    springLocation.y = springLocation.y + springVelocity;
  }

  if (abs(springVelocity) < 0.1) {
    springVelocity = 0.0;
  }

  if (move) {
    springLocation.y = playerLocation.y + playerHeight - 30;
    if (springLocation.y > springRestLocation.y + springInitialHeight - springMinHeight) {
      springLocation.y = springRestLocation.y + springInitialHeight - springMinHeight;
    }
    if (springLocation.y < springRestLocation.y - (springMaxHeight - springInitialHeight)) {
      springLocation.y = springRestLocation.y - (springMaxHeight - springInitialHeight);
    }
  }

  if (springLocation.y > springRestLocation.y) {
    springHeight = springRestLocation.y + springInitialHeight - springLocation.y;
  }
  if (springLocation.y < springRestLocation.y) {
    springHeight = springRestLocation.y - springLocation.y + springInitialHeight;
  }
  springWidth = 1 * 5000 / springHeight;
  springLocation.x = (canvasWidth - springWidth) / 2;
}

function drawSpring() {
  fill(227, 64, 0);
  rect(springLocation.x, springLocation.y, springWidth, springHeight, 20);
}

function checkMove() {
  if (playerLocation.y + playerHeight - 30 > springRestLocation.y && playerLocation.y < springRestLocation.y + springInitialHeight) {
    playerVelocity.y *= -1;
    move = true;
  } else {
    move = false;
  }
}
