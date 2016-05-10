'use strict';
(function () {

    var MAX_SIZE_PER_READ = 100;
    var workingDirectory = os._internals.fs.disk.root;
    os.fs.read = readFile;

    /*
    example usage:
    os.fs.read(filehandle, size, cb);
    filehandle is the filehandle given from os.fs.open
    size is the number of characters to read
    cb is a function which takes 2 arguments:
    error: an error if one occurred
    data: the actual data returned by the fs
     */
    function readFile (fileHandle, size, cb) {

        var psname = os._internals.ps.runningProcess.slice(0);
        

        //var realFileHandle = os._internals.fs.disk[filehandle.name].meta;

        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performReadOperation(psname, fileHandle, size, cb);
                }, generateRandomTimeout());    
            },
            // copy string
            processName: psname
        });
    }

    /*
     performs the actual read operation on the disk (syncronously) as operation is wrapping it asynchronously
     */
    function performReadOperation(psname, filehandle, size, cb) {
        
        // path must be preserved to update working directory
        
        //TODO need to find a better way to update working directory
        //TODO without having to keep throwing the path around
        var readTarget = parsePath(filehandle.path);

        var entrypoint;
        if (size > MAX_SIZE_PER_READ) {
            // call cb with an error
            entrypoint = function () {
                cb(-1);
            };

        } else {
            // valid request return the data
            entrypoint = function () {
                cb(0, workingDirectory[filehandle.fileName].data.substr(filehandle.pos, size));
            };
        }

        os._internals.ps.fsOperationReadyToReturn(psname, entrypoint);
    }

    /*
     generates a random interval between 10 and 100 ms
     */
    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
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