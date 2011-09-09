define([], function() {
  var Time = {
    now: 0,      
    prev: 0,
    delta: 0,
    seconds: 0,
    frameNumber: 0,
    fpsFrames: 0,
    fpsTime: 0,
    fps: 0  
  }  

  Time.update = function() {
    if (Time.prev == 0) {
      Time.prev = (new Date()).getTime(); 
    }
    Time.now = (new Date()).getTime();
    Time.delta = (Time.now - Time.prev)/1000;
    Time.prev = Time.now;		                              
    Time.seconds += Time.delta;	  
    Time.fpsTime += Time.delta;  
    Time.frameNumber++;
    Time.fpsFrames++;
    if (Time.fpsTime > 5) {
    	Time.fps = Time.fpsFrames / Time.fpsTime;
    	Time.fpsTime = 0;   
    	Time.fpsFrames = 0;			
    	console.log("FPS: " + Time.fps);
    }  
    return Time.seconds;
  }
  
  return Time;  
});
