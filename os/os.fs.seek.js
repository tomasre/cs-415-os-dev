'use strict';
(function(){
  os.fs.seek = seekFile;


  function seekFile(fileHandle, charsRead, cb){

    var psname = os._internals.ps.runningProcess.slice(0);

    var realFileHandle = os._internals.fs.disk[fileHandle.name].meta;

    os._internals.fs.operationQueue.pus({
      operation: function(){
        setTimeout(function() {
          performSeekOperation(psname, realFileHandle, charsRead, cb);



        }, genenerateRandomTimeout());
      },

      processName: psname



    });
  }

    function performSeekOperation(psname, fileHandle, charsRead, cb){
      var entrypoint;
      var startPoint = os._internals.fs.disk[fileHandle.name].meta.pos;


      if (typeof os._internals.fs.disk[fileHandle.name]==="undefinded"){
        entrypoint = function(){
          cb('seek error')
        }
       }else {

        os._internals.fs.disk[fileHandle.name].meta.pos = startPoint + charsRead;
        entrypoint = function() {
          cb(null);
        }

        os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);



      }


    }
    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }


})();