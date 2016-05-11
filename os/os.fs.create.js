'use strict';
(function(){
    // starts at root
    var workingDirectory = os._internals.fs.disk.root;

  os.fs.create = createFile;

  function createFile(fileName, cb){
     var process = os._internals.ps.runningProcess.slice(0);


     os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function(){
          performCreateOperation(process,fileName, cb);
        }, generateRandomTimeout());
      },
      processName: process
  });

   }

  function performCreateOperation(psname, fileName, cb){
    var entrypoint;
    console.log(fileName);
      var createTarget = parsePath(fileName);
      console.log("Create Target: " + createTarget);

    if(typeof workingDirectory[createTarget] === "undefined"){

    workingDirectory[createTarget]={

    //  data: '',
    //  meta: {}

    };

    entrypoint = function(){
      cb(0,fileName)
    }

  } else {
        entrypoint = function () {
            cb(-1);
        }
    }
      os._internals.ps.fsOperationReadyToReturn(psname,entrypoint);
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