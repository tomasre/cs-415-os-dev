'use strict';
(function(){
  os.fs.seek = seekFile;


  function seekFile(fileHandle, charsRead, cb){

    var psname = os._internals.ps.runningProcess.slice(0);

    var realFileHandle = os._internals.fs.disk[fileHandle.name].meta;

    os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function() {
          performSeekOperation(psname, realFileHandle, charsRead, cb);



        }, generateRandomTimeout());
      },

      processName: psname



    });
  }

    function performSeekOperation(psname, fileHandle, charsRead, cb){
      console.log("Seek Operation: "+psname);
      var entrypoint;
      var startPoint = os._internals.fs.disk[fileHandle.name].meta.pos;


      if (typeof os._internals.fs.disk[fileHandle.name]==="undefined"){
        entrypoint = function(){
          cb(-1)
        }
       }else {

        os._internals.fs.disk[fileHandle.name].meta.pos = startPoint + charsRead;
        entrypoint = function() {
          cb(0);
        }

        os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);



      }


    }
    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }


})();