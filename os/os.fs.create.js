'use strict';
(function(){

  os.fs.create = createFile;

  function createFile(fileName, cb){
     var process = os._internals.ps.runningProcess.slice(0);

     os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function(){
          performCreateOperation(process,fileName, cb);
        }, generateRandomTimeout());
      },

      processName: process;


  });

   }

  function createFile(processName, fileName, cb){
    var entrypoint;

    if(typeof os._internals.fs.disk[fileName] === "undefined"){
    //creats new string at "DISK LOCATION"
  os._internals.fs.disk[fileName]={

    data: "",
    meta: {}
    };

    entrypoint = function(){
      cb(null,fileName)
    }

  } else {

    cb('File already exists');
  }
}
  


function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }









})();