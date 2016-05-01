'use strict';
(function(){
  os.fs.seek = seekFile;
  var workingDirectory = os._internals.fs.disk.root;


  function seekFile(fileHandle, charsRead, cb){

    var psname = os._internals.ps.runningProcess.slice(0);

    //var realFileHandle = workingDirectory[fileHandle.fileName].meta;

    os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function() {
          performSeekOperation(psname, fileHandle, charsRead, cb);



        }, generateRandomTimeout());
      },

      processName: psname



    });
  }

    function performSeekOperation(psname, fileHandle, charsRead, cb){
     // console.log("Seek Operation: "+psname);
      var temp = parsePath(fileHandle.path);
      var entrypoint;
      var startPoint = workingDirectory[fileHandle.fileName].meta.pos;


      if (typeof workingDirectory[fileHandle.fileName]==="undefined"){
        entrypoint = function(){
          cb(-1)
        }
       }else {

        workingDirectory[fileHandle.fileName].meta.pos = startPoint + charsRead;
        entrypoint = function() {
          cb(0);
        }
        os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);
      }


    }
  function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }

  function parsePath(path) {
    //splits absolute path provided to the function by pash
    var splitPath = path.split('/');
    console.log(splitPath);

    //insures the working directory starts at root
    workingDirectory = os._internals.fs.disk.root;

    // removes root from the path
    splitPath.shift();

    //removes destinations from the path
    var newFileName = splitPath.pop();

    console.log(splitPath);

    if (splitPath.length > 0){
      for( var i = 0; i< splitPath.length; i++) {
        var temp;
        temp = workingDirectory[splitPath[i]];
        workingDirectory = temp;
      }
    }
    //returns name of the file you want to create
    return newFileName;
  }


})();