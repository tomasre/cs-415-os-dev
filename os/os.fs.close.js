'use strict';


(function() {
  os.fs.close = closeFile;

  var workingDirectory = os._internals.fs.disk.root;

  //points the disk operation on the stack because there must
  function closeFile (fileName, cb) {


    var process = os._internals.ps.runningProcess.slice(0);

    os._internals.fs.operationQueue.push({
      operation: function () {
        setTimeout(function () {
          performCloseFile(process, fileName, cb);
        }, generateRandomTimeout());
      }
    });
  }

    // the actual closing file operation
    function performCloseFile(process, fileName, cb) {
      var entrypoint;
      var msg;
      var closeTarget = parsePath(fileName);

      if (typeof workingDirectory[closeTarget] === "undefined") {
        msg = "failure";
        // the name of the file does not exist in the drive, return -1 to denote an error
        entrypoint = function () {

          cb(-1, msg);
        }

      } else if (!workingDirectory[closeTarget].meta.fileInUse) {
        msg = 'failure';
        // fileInUse was already false i.e. closed return an error
        entrypoint = function () {

          cb(-1, msg);
        }


      } else {
        msg = 'success';
        // file exists, and we change the fileInUse to false so others can use the file
        // also need to set position back to zero
        workingDirectory[closeTarget].meta.fileInUse = false;
        workingDirectory[closeTarget].meta.pos = 0;

        entrypoint = function () {
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

    function parsePath(path) {
      //splits absolute path provided to the function by path
      var splitPath = path.split('/');
      console.log(splitPath);

      //insures the working directory starts at root
      workingDirectory = os._internals.fs.disk.root;

      // removes root from the path
      splitPath.shift();

      //removes destinations from the path
      var newFileName = splitPath.pop();

      console.log(splitPath);

      if (splitPath.length > 0) {
        for (var i = 0; i < splitPath.length; i++) {
          var temp;
          temp = workingDirectory[splitPath[i]];
          workingDirectory = temp;
        }
      }
      //returns name of the file you want to create
      return newFileName;
    }

}) ();
