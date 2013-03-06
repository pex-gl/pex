define(['pex/utils/Log'], function(Log) {
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
    paused: false
  }

  Time.update = function(delta) {
    if (Time.paused) return;

    if (Time.prev == 0) {
      Time.prev = (new Date()).getTime();
    }
    Time.now = (new Date()).getTime();
    Time.delta = (delta !== undefined) ? delta : (Time.now - Time.prev)/1000;
    Time.prev = Time.now;
    Time.seconds += Time.delta;
    Time.fpsTime += Time.delta;
    Time.frameNumber++;
    Time.fpsFrames++;
    if (Time.fpsTime > Time.fpsFrequency) {
      Time.fps = Time.fpsFrames / Time.fpsTime;
      Time.fpsTime = 0;
      Time.fpsFrames = 0;
      Log.message('FPS: ' + Time.fps);
    }
    return Time.seconds;
  }

  var startOfMeasuredTime = 0;
  Time.startMeasuringTime = function() {
    startOfMeasuredTime = (new Date()).getTime();
  }

  Time.stopMeasuringTime = function(msg) {
    var now = (new Date()).getTime();

    var seconds = (now - startOfMeasuredTime)/1000;

    if (msg) {
      Log.message(msg + seconds)
    }
    return seconds;
  }

  Time.pause = function() {
    Time.paused = true;
  }

  Time.togglePause = function() {
    Time.paused = !Time.paused;
  }

  return Time;
});
