(function() {
  var workingDirectory = os._internals.fs.disk.root;

  os.fs.open = openFile;


  function openFile(path, cb){
    var process = os._internals.ps.runningProcess.slice(0);

    os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function(){
          performOpenOperation(process,path, cb);
        }, generateRandomTimeout());
      },



      processName: process
    });
  }

  //performs fake open operation  on string ie>> creates file handle
  function performOpenOperation (psname, path, cb) {

    var openTarget = parsePath(path);
    
    //console.log("Open Operation: "+psname);
    var entrypoint;


    if (!workingDirectory[openTarget]){ //checks if the property is defined
      entrypoint = function(){
        cb(-1);
        };

      } else {
          workingDirectory[openTarget].meta={// if "file" exists creates the file handle setting pos to zero
            path: path,
            fileName:openTarget,
            pos: 0,
            size: workingDirectory[openTarget].data.length,
            fileInUse: true
          };
            entrypoint = function(){
            cb(0, workingDirectory[openTarget].meta)
            };
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
