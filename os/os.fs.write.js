(function(){

var MAX_WRITE_SIZE = 100;
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
  var fileString = os._internals.fs.disk[fileName].data;

  
  if(withinMaxSize(dataPar.length) && fileExists(fileName)){

    os._internals.fs.disk[fileName].data = fileString + dataPar;

    entrypoiont = function(){

      cb(null,fileName)

    }
  

    } else {

      entrypoint = function() {

        cb('write error');

      }
    }
  


    os._internals.ps.fsOperationReadyToReturn(psname,entrypoint);

    }

function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }

function withinMaxSize(dataLength){

  if(data <= 100 ){

    return true;

  } else {

    return false;

  }
}

function fileExists(name){

  if(typeof os._internals.fs.disk[name] === "undefined") {

    return false;

  } else {

    return true;

  }
}









})();