"use strict";

import { config } from "./config.js";
import { util } from "./util.js";
import { Spring } from "./spring.js";
import { Player } from "./player.js";
import { Clock } from "./clock.js";
import { Cloud } from "./cloud.js";

export default function sketch(p) {
  let seconds = config.seconds;
  let isStarted = false;
  let numberOfSprings;
  let lastSpringX;

  let springs = [];
  let clouds = [];
  let player;
  let clock;

  let cloudImages = [];
  let playerImage;
  let springImage;
  let clockImage;

  let jumpSound;
  let catchClockSound;
  let bellSound;
  let lostSound;

  p.preload = function () {
    loadImages();
    loadSounds();
  };

  p.setup = function () {
    p.createCanvas(config.canvasWidth, config.canvasHeight);
    calculateNumberOfSprings();
    generateClouds();
    generatePlayer();
    generateSprings();
    generateClock();
    drawBackground();
    drawClouds();
    drawPlayer();
    drawSprings();
    drawTime();
    drawScore();
  };

  p.draw = function () {
    p.frameRate(config.framesPerSecond);
    drawBackground();
    drawClouds();
    updateClouds();
    updatePlayer();
    updateSprings();
    updateClock();
    checkSpringsHit();
    checkClockCatched();
    checkGameOver();
    drawClock();
    drawPlayer();
    drawSprings();
    drawTime();
    drawScore();
  };

  function loadImages() {
    for (let i = 1; i <= 11; i++) {
      cloudImages.push(p.loadImage(`images/cloud-${i < 10 ? "0" + i : i}.svg`));
    }
    playerImage = p.loadImage("images/player.svg");
    springImage = p.loadImage("images/spring.svg");
    clockImage = p.loadImage("images/clock.svg");
  }

  function loadSounds() {
    jumpSound = p.loadSound("sounds/jump.mp3");
    catchClockSound = p.loadSound("sounds/catch-clock-2.mp3");
    bellSound = p.loadSound("sounds/bell-1.mp3");
    lostSound = p.loadSound("sounds/lost.mp3");
  }

  function calculateNumberOfSprings() {
    numberOfSprings =
      3 *
      (Math.floor(
        (config.canvasWidth - springImage.width) /
          (springImage.width + config.minimumSpringsDistance)
      ) +
        1);
  }

  function start() {
    isStarted = true;
    let interval = setInterval(function () {
      if (isStarted) {
        seconds--;
        if (seconds === 0) {
          clearInterval(interval);
          clock.hide();
          bellSound.play();
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  function generateClouds() {
    for (let i = 0; i < config.numberOfClouds; i++) {
      clouds.push(new Cloud({ p: p, images: cloudImages }));
    }
  }

  function generatePlayer() {
    player = new Player({
      p: p,
      image: playerImage,
      jumpSound: jumpSound,
      catchClockSound: catchClockSound,
    });
  }

  function generateSprings() {
    let x = -50;
    let y = config.canvasHeight - 150;
    for (let i = 0; i < numberOfSprings; i++) {
      springs.push(
        new Spring({
          p: p,
          image: springImage,
          x: x,
          y: y,
        })
      );
      x = util.generateRandomInteger(
        x + springImage.width + config.minimumSpringsDistance,
        x + springImage.width + config.maximumSpringsDistance
      );
      y = util.generateRandomInteger(
        config.canvasHeight - 300,
        config.canvasHeight - 100
      );
    }
    lastSpringX = springs[springs.length - 1].location.x;
  }

  function generateClock() {
    clock = new Clock({ p: p, image: clockImage });
  }

  function drawBackground() {
    p.background(111, 197, 206);
  }

  function drawClouds() {
    for (let cloud of clouds) {
      cloud.draw();
    }
  }

  function drawClock() {
    clock.draw();
  }

  function drawPlayer() {
    player.draw();
  }

  function drawSprings() {
    for (let spring of springs) {
      spring.draw();
    }
  }

  function drawTime() {
    p.noStroke();
    p.fill(0, 0, 0, 80);
    p.rect(config.canvasWidth - 200, 20, 80, 40, 10);
    p.fill(255, 255, 255);
    p.textFont("Ubuntu", 25);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(seconds + "s", config.canvasWidth - 160, 40);
  }

  function drawScore() {
    p.noStroke();
    p.fill(0, 0, 0, 80);
    p.rect(config.canvasWidth - 100, 20, 80, 40, 10);
    p.fill(255, 255, 255);
    p.textFont("Ubuntu", 25);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(
      Math.floor(player.numberOfPassedPixels / config.pixelsPerMeter) + "m",
      config.canvasWidth - 60,
      40
    );
  }

  function updateClouds() {
    for (let cloud of clouds) {
      cloud.update(player.numberOfPassedPixels);
    }
  }

  function updatePlayer() {
    if (!player.isResting) {
      player.update();
    }
  }

  function updateSprings() {
    let count = 0;
    for (let spring of springs) {
      spring.update(player.numberOfPassedPixels, lastSpringX, seconds > 0);
      if (spring.location.x > lastSpringX && !spring.hit) {
        lastSpringX = spring.location.x;
      }
      count++;
    }
  }

  function updateClock() {
    if (seconds > 0) {
      clock.update(player.numberOfPassedPixels);
    }
  }

  function checkSpringsHit() {
    for (let spring of springs) {
      if (spring.checkHit(player)) {
        if (!isStarted) {
          start();
        }
        player.jump();
      }
    }
  }

  function checkClockCatched() {
    if (clock.checkHit(player) && seconds > 0) {
      player.catchClock();
      seconds += 5;
      clock.update(player.numberOfPassedPixels);
    }
  }

  function checkGameOver() {
    if (player.isOut() && isStarted) {
      isStarted = false;
      seconds = config.seconds;
      //p.noLoop();
      lostSound.play();
      player.numberOfPassedPixels = 0;
    }
  }
}
