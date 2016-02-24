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

      //copy string ???? do not know why this is required

      processName: process
    });
  }

  //performs fake open operation  on string ie>> creats file handle
  function performOpenOperation (psname, fileName, cb) {

    var entrypoint;

    //checks if the property is defined
    if (!os._internals.fs.disk[fileName]){
      entrypoint = function(){
        cb('file does not exist');

        }

    // if "file" exists creates the file handle setting pos to zero

      } else {
          os._internals.fs.disk[fileName].meta={

            name: fileName,

            pos: 0,
            
            fileInUse: true
          };

            entrypoint = function(){

            cb(null,os._internals.fs.disk[fileName].meta)

            }

             os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);


          }

        }
function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
  
})();
