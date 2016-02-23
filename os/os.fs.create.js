'use strict'

/*
    example usage:
    os.fs.write(fileName cb);
    fileName is the name of the file you want to write to
    cb is a function which takes 2 arguments:
    error: an error if one occurred
    wroteToFile: which is a bool that returns true if we wrote to file and false if we didn't
*/

(function() {
  os.fs.create = createFile;
  
  var createFile = function(fileName, cb) {
    var psname = os._internals.ps.runningProcess.slice(0);
    
    // Checks if the file exists, if so perform the operation. If not, return an error
    if (typeof os._internals.fs.disk[fileName] === "undefined"){
      os._internals.fs.operationQueue.push({
        operation: function() {
          processName: psname, 
          setTimeout(function () {
            performCreateOperation(psname, fileName, cb);
          }, generateRandomTimeout());
        }
      });
    } else {
      cb("File already exists inside of the disc", false);
    }
  }
  
  var performCreateOperation(psname, fileName, cb) {
    var entrypoint;
    
    entrypoint = function() {
      /*
        Create a new file inside of the simulated disk, declare as an array to hold the result later on.
        cb returns null, then true to tell the process(e?) that the file has been created.
      */
      os._internals.fs.disk[fileName] = new Object();
      cb(null, true);
    }
    
    os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);
  }
  
  /* 
    generates a random interval between 10 and 100 ms
  */
  function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
})();
