"use strict";

let config = {
  canvasWidth: document.body.clientWidth,
  canvasHeight: document.body.clientHeight,
  framesPerSecond: 60,
  pixelsPerMeter: 100,
  coordinateSystemCenterX: 0,
  seconds: 5,
  numberOfClouds: 5,
  minimumSpringsDistance: 200,
  maximumSpringsDistance: 400,
};
config.framesTimeInterval = 1 / config.framesPerSecond;

export { config };