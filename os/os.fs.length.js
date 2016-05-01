(function(){

os.fs.length = lengthOf;
  var workingDirectory = os._internals.fs.disk.root;


function lengthOf (fileName, cb) {
  var process = os._internals.ps.runningProcess.slice(0);

  os._internals.fs.operationQueue.push({
    operation: function(){

      setTimeout(function(){
        performLengthOfOperation(process,fileName,cb);
      }, generateRandomTimeout());
    },

    processName: process
  });
}

function performLengthOfOperation(psname,fileName,cb){
  console.log("Length Operation: "+psname);
  var lengthTarget = parsePath(fileName);

  var entrypoint;

  try {

    var size = workingDirectory[lengthTarget].data.length;
    workingDirectory[lengthTarget].size = size;
    entrypoint =function() {
      cb(0, size);
    }

  } catch (e){

    console.log(e);
    entrypoint = function(){
    cb(-1);
    }
  }

  os._internals.ps.fsOperationReadyToReturn(psname,entrypoint);
}

function generateRandomTimeout(){
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