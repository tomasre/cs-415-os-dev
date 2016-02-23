(function(){

os.fs.write = writeFile;

function writeFile(fileName,data,cb){
  var process = os._internals.ps.runningProcess.slice(0);

  os._internals.fs.operationQueue.push({
    operation: function(){
      setTimeout(function(){
        performWriteFile(process, fileName, data, cb);
      },generateRandomTimeout());
    },
    processName: process
  });

}

function performWriteFile(psname, fileName, dataPar, cb){
  var entrypoint;

  if(typeof os._internals.fs.disk[fileName] === "undefined"){
    //creats new string at "DISK LOCATION"
  os._internals.fs.disk[fileName]={

    data: dataPar,
    meta: {}
    };

    entrypoint= function() {
    cb(null, fileName);
  }

  } else {
    entrypoint = function(){
    cb('file already exists');
      }
  }

    os._internals.ps.fsOperationReadyToReturn(psname,entrypoint);
    }

function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }









})();