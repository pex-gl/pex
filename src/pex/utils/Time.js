define(['pex/utils/Log'], function (Log) {
  var Time = {
      now: 0,
      prev: 0,
      delta: 0,
      seconds: 0,
      frameNumber: 0,
      fpsFrames: 0,
      fpsTime: 0,
      fps: 0,
      fpsFrequency: 3,
      paused: false,
      verbose: false
    };
  Time.update = function (delta) {
    if (Time.paused)
      return;
    if (Time.prev === 0) {
      Time.prev = Date.now();
    }
    Time.now = Date.now();
    Time.delta = delta !== undefined ? delta : (Time.now - Time.prev) / 1000;
    //More than 1s = probably switched back from another window so we have big jump now
    if (Time.delta > 1) {
      Time.delta = 0;
    }
    Time.prev = Time.now;
    Time.seconds += Time.delta;
    Time.fpsTime += Time.delta;
    Time.frameNumber++;
    Time.fpsFrames++;
    if (Time.fpsTime > Time.fpsFrequency) {
      Time.fps = Time.fpsFrames / Time.fpsTime;
      Time.fpsTime = 0;
      Time.fpsFrames = 0;
      if (this.verbose)
        Log.message('FPS: ' + Time.fps);
    }
    return Time.seconds;
  };
  var startOfMeasuredTime = 0;
  Time.startMeasuringTime = function () {
    startOfMeasuredTime = Date.now();
  };
  Time.stopMeasuringTime = function (msg) {
    var now = Date.now();
    var seconds = (now - startOfMeasuredTime) / 1000;
    if (msg) {
      Log.message(msg + seconds);
    }
    return seconds;
  };
  Time.pause = function () {
    Time.paused = true;
  };
  Time.togglePause = function () {
    Time.paused = !Time.paused;
  };
  return Time;
});