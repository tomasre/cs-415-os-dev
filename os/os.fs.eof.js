'use strict';

/*
 Example useage:
 os.fs.eof(fileHandle, cb);
 fileHandle is the fileHandle provided by os.fs.open
 cb is a function which takes 2 arguments,
 MSG: msg for whether at eof or not. display only when eof === true
 atEof: bool, true for eof and false for !eof
 */

(function() {

  os.fs.eof = eof;

  function eof (fileHandle, cb) {
    var psname = os._internals.ps.runningProcess.slice(0);


    //super fucking redundant. i could just pass the file handle but i will stick with your code
    if(os._internals.fs.disk[fileHandle.name].meta) {
      var realFileHandle = os._internals.fs.disk[fileHandle.name].meta;

      os._internals.fs.operationQueue.push({
        operation: function(){
          setTimeout(function() {
            performEOFOperation(psname, realFileHandle, cb);
          }, generateRandomTimeout());
        },
        // copy string
        processName: psname
      });
    } else {
      cb("File not found");
    }
  };

  // Performs the actual check for EOF
  function performEOFOperation(psname, realFileHandle, cb) {

    var entrypoint;

    // check to see if file pos is > than file size(shouldnt happen but must provide the check)
    if(realFileHandle.pos > realFileHandle.size) {
      entrypoint = function() {
        cb("Seek is at a position that doesn't exist inside of the file!", true);
      };
      // check if file pos === file size, if so return true for atEOF
    } else if(realFileHandle.pos === realFileHandle.size) {
      entrypoint = function() {
        cb("Done, at the end of the file", true);
      };
      // file is not done being read, return atEOF to be false
    } else {
      entrypoint = function() {
        cb(null, false);
      }
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
