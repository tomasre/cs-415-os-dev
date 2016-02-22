(function() {

  os.fs.open = openFile;

  function openFile (fileName, cb) {

    var psname = os._internals.ps.runningProcess.slice(0);
    var entrypoint;

    //checks if the property is defined
    if (typeof os._internals.fs.disk[fileName] === "undefined"){
      entrypoint = function(){
        cb('file does not exist');

        }

    // if "file" exists creates the file handle setting pos to zero

      } else {
          os._internals.fs.disk[fileName].meta={

            name: filename,

            pos: 0

            entrypoint = function(){

            cb(null,os._internals.fs.disk[fileName].meta)

            }

             os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);


          };

        }






    }




  






})();
