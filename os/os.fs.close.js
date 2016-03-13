'use strict';


(function() {
  os.fs.close = closeFile;

  //points the disk operation on the stack because there must
  function closeFile (fileName, cb) {
    var process = os._internals.ps.runningProcess.slice(0);

    os._internals.fs.operationQueue.push({
      operation: function () {
        setTimeout(function () {
          performCloseFile(process, fileName, cb);
        }, generateRandomTimeout());
      },
      processName: process
    });
  }

  // the actual closing file operation
  function performCloseFile (process, fileName, cb) {
    var entrypoint;
    var msg;

    if (typeof os._internals.fs.disk[fileName] === "undefined") {
      msg = "failure";
      // the name of the file does not exist in the drive, return -1 to denote an error
      entrypoint = function () {

        cb(-1,msg);
      }

    } else if (!os._internals.fs.disk[fileName].meta.fileInUse) {
      msg= 'failure';
      // fileInUse was already false i.e. closed return an error
      entrypoint = function () {

        cb(-1,msg);
      }

    } else {
      msg='success';
      // file exists, and we change the fileInUse to false so others can use the file
      // also need to set position back to zero
      os._internals.fs.disk[fileName].meta.fileInUse = false;
      os._internals.fs.disk[fileName].meta.pos = 0;

      entrypoint = function() {
        cb(0, msg);
      }
    }

    // we have finished performing the close operation
    os._internals.ps.fsOperationReadyToReturn(process, entrypoint);
  }

  /*
   generates a random interval between 10 and 100 ms to simulate disk operations
   */
  function generateRandomTimeout() {
    return Math.floor(Math.random() * (100 - 10) + 10);
  }
})();
