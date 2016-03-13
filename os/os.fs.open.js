(function() {

  os.fs.open = openFile;


  function openFile(fileName, cb){
    var process = os._internals.ps.runningProcess.slice(0);

    os._internals.fs.operationQueue.push({
      operation: function(){
        setTimeout(function(){
          performOpenOperation(process,fileName, cb);
        }, generateRandomTimeout());
      },



      processName: process
    });
  }

  //performs fake open operation  on string ie>> creates file handle
  function performOpenOperation (psname, fileName, cb)
  {
    //console.log("Open Operation: "+psname);
    var entrypoint;


    if (!os._internals.fs.disk[fileName]){ //checks if the property is defined
      entrypoint = function(){
        cb(-1);
        };

      } else {
          os._internals.fs.disk[fileName].meta={// if "file" exists creates the file handle setting pos to zero
            name: fileName,
            pos: 0,
            size: os._internals.fs.disk[fileName].data.length,
            fileInUse: true
          };
            entrypoint = function(){
            cb(0,os._internals.fs.disk[fileName].meta)
            };
             os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);
          }
        }
function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
  
})();
