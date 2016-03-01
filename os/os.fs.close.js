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

   function closeFile (FNAME, cb) {
    var psname = os._internals.ps.runningProcess.slice(0);

    os._internals.fs.operationQueue.push({
      operation: function () {
        setTimeout(function () {
          performCloseFile(psname, FNAME, cb);
        }, generateRandomTimeout());
      },
      processName: psname
    });
  }

  // the actual closing file operation
  function performCloseFile (psname, FNAME, cb) {
    var entrypoint;

    if(typeof os._internals.fs.disk[name] === "undefined"){

      entrypoint = function(){
        cb('error');
      }
    } else {
      entrypoint = function(){

      }
    }





    // we have finished performing the close operation
    os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);
  }

  /*
   generates a random interval between 10 and 100 ms
   */
  function generateRandomTimeout() {
    return Math.floor(Math.random() * (100 - 10) + 10);
  }
})();
