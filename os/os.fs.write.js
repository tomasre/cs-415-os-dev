'use strict';
/*
CONDITIONALLY CREATING RIGHT NOW IF DOES NOT EXIST
 */
(function(){

    var MAX_WRITE_SIZE = 100;
    os.fs.write = writeFile;

    function writeFile(fileName,data,cb){
        var psname = os._internals.ps.runningProcess.slice(0);

        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performWriteFile(psname, fileName, data, cb);
                }, generateRandomTimeout());
            },
            // copy string
            processName: psname
        });
    }

    function performWriteFile(psname, fileName, dataPar, cb){
        console.log("Write Operation: "+psname);
        var entrypoint;

        if (!os._internals.fs.disk[fileName]) {
            os._internals.fs.disk[fileName] = {
                data:'',
                meta: {

                }
            }
        }
        var fileString = os._internals.fs.disk[fileName].data;

        if(withinMaxSize(dataPar.length) && fileExists(fileName)){
            os._internals.fs.disk[fileName].data = fileString + dataPar;
            entrypoint = function(){
                cb(0,fileName)
            }
        } else {
            entrypoint = function() {
                cb(-1);
            }
        }

        os._internals.ps.fsOperationReadyToReturn(psname,entrypoint);

    }

    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }

    function withinMaxSize(dataLength){

        if(dataLength <= 100 ){

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