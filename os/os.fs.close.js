'use strict'

(function() {
  os.fs.close = closeFile;
  
  var closeFile = function(FNAME, cb) {
    var psname = os._internals.ps.runningProcess.slice(0);
    
    os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function(){
          performCloseFile(psname, FNAME, cb);
        },generateRandomTimeout());
      },
      processName: process
    });
  };
  
  var performCloseFile = function(psname, FNAME, cb) {
    var entrypoint;
  };
  
  function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
)}();
