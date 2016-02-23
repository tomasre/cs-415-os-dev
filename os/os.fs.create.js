'use strict'

(function() {
  os.fs.create = createFile;
  
  var createFile = function() {
    // Checks if the file exists, if so perform the operation. If not, return an error
    if (typeof os._internals.fs.disk[fileName] === "undefined"){
      os._internals.fs.operationQueue.push({
        operation: function() {
          processName: psname, 
          setTimeout(function () {
            performCreateOperation(psname, fileName, size, cb);
          }, generateRandomTimeout());
        }
      });
    } else {
      cb("File already exists inside of the disc");
    }
  }
  
  var performCreateOperation(psname, fileName, cb) {
    var entrypoint;
    
    entrypoint = function() {
      /*
        Create a new file inside of the simulated disk, declare as an array to hold the result later on.
        cb returns null, then true to tell the process(e?) that the file has been created.
      */
      os._internals.fs.disk[fileName] = [];
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
