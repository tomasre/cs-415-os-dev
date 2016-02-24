'use strict'

/*
  example usage:
  os.fs.close(FNAME, cb)
  FNAME is the name of the file which you want to close
  cb is a function which takes 2 arguments:
  errorClosingFile: a bool which tells if there was an error
  errorMessage: the actual error message
*/

(function() {
  os.fs.close = closeFile;
  
  var closeFile = function(FNAME, cb) {
    var psname = os._internals.ps.runningProcess.slice(0);
    
    os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function(){
          performCloseFile(psname, FNAME, cb);
        },generateRandomTimeout());
      },
      processName: process
    });
  };
  
  // the actual closing file operation
  var performCloseFile = function(psname, FNAME, cb) {
    var entrypoint;
    
    if(typeof os._internals.fs.disk[FNAME] == "undefined") {
      // the name of the file does not exist in the drive, return an error
      entrypoint = function() {
        cb(true, "The file does not exist, you are attempting to close a ghost file.");
      }
    } else if(!os._internals.fs.disk[FNAME].meta.fileInUse) {
      // fileInUse was already false i.e. closed return an error
      entrypoint = function() {
        cb(true, "file was already closed!");
      }
    } else {
      // file exists, and we change the fileInUse to false so others can use the file
      os._internals.fs.disk[FNAME].meta.fileInUse = false;
      cb(false);
    }
    
    // we have finished performing the close operation
    os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);
  };
  
  /*
    generates a random interval between 10 and 100 ms
   */  
  function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
)}();
