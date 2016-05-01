'use strict';
/*
CONDITIONALLY CREATING RIGHT NOW IF DOES NOT EXIST
 */
(function(){

    var MAX_WRITE_SIZE = 100;
    os.fs.write = writeFile;
    var workingDirectory = os._internals.fs.disk.root;

    function writeFile(path,data,cb){
        var psname = os._internals.ps.runningProcess.slice(0);

        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performWriteFile(psname, path, data, cb);
                }, generateRandomTimeout());
            },
            // copy string
            processName: psname
        });
    }

    function performWriteFile(psname, path, dataPar, cb){
        var entrypoint;
        var writeTarget = parsePath(path);

        var fileString = workingDirectory[writeTarget].data;

        if(withinMaxSize(dataPar.length) && fileExists(writeTarget)){
            workingDirectory[writeTarget].data = fileString + dataPar;
            entrypoint = function(){
                cb(0,path)
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
        if(dataLength <= MAX_WRITE_SIZE ){
            return true;
        } else {
            return false;
        }
    }

    function fileExists(name){
        if(typeof workingDirectory[name] === "undefined") {
            return false;
        } else {
            return true;
        }
    }

    function parsePath(path) {
        //splits absolute path provided to the function by pash
        var splitPath = path.split('/');
        console.log(splitPath);

        //insures the working directory starts at root
        workingDirectory = os._internals.fs.disk.root;

        // removes root from the path
        splitPath.shift();

        //removes destinations from the path
        var newFileName = splitPath.pop();

        console.log(splitPath);

        if (splitPath.length > 0){
            for( var i = 0; i< splitPath.length; i++) {
                var temp;
                temp = workingDirectory[splitPath[i]];
                workingDirectory = temp;
            }
        }
        //returns name of the file you want to create
        return newFileName;
    }

})();