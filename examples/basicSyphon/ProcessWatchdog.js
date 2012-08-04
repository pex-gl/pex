define([], function() {
  var exec = require('child_process').exec;


  function getProcessId(name, callback) {
    var cmdline = 'ps ax | grep -v grep | grep "' + name + '"';
    exec(cmdline, function (error, stdout, stderr) {
      if (!error) {
        var pid = stdout.split(" ")[0];
        callback(pid);
      }
      else {
        callback(null);
      }
    });
  }

  function killProcess(pid, callback) {
    var cmdline = 'kill -KILL ' + pid;
    exec(cmdline, function (error, stdout, stderr) {
      callback();
    });
  }

  function runProcess(path, callback) {
    console.log('runProcess');
    exec('"' + path + '"', function(error, stdout, stderr) {
      console.log('runProcess ended');
      if (error) callback(error);
      else callback(path + " is running!");
    })
  }

  function checkKillRespawn(name, path, callback) {
    console.log('checkKillRespawn');
    getProcessId(name, function(pid) {
      console.log("Process id : " + pid);
      if (pid) {
        console.log('killing');
        killProcess(pid, function() {
        console.log('killed')
          //setTimeout(function() {
            console.log('running after killing')
            runProcess(path, function(msg) {
              console.log(msg);
              callback();
            });
            //}, 500)
        })
      }
      else {
        console.log('run')
        runProcess(path, function(msg) {
          console.log('runned')
          console.log(msg);
          callback();
        });
      }
    })
  }

  function checkAndRespawn(name, path, callback) {
    getProcessId(name, function(pid) {
      if (!pid) {
        runProcess(path, function(msg) {
          console.log(msg);
          callback();
        });
      }
    })
  }

  function ProcessWatchdog() {
  }

  ProcessWatchdog.prototype.watch = function(name, path, callback) {
    console.log("watch");
    //setTimeout(function() {
      console.log("watching");
      checkKillRespawn(name, path, function() {
        console.log("killed and respawned");
        setInterval(function() {
          checkAndRespawn(name, path, function() {
            if (callback) callback();
          });
        }, 3000)
      });
      //}, 1);
  }

  return ProcessWatchdog;
})