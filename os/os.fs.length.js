(function(){

os.fs.length = lengthOf;

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
  console.log("Open Operation: "+psname);
  
  var entrypoint;

  try {

    var size = os._internals.fs.disk[fileName].data.length;
    os._internals.fs.disk[fileName].size = size;
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


})();