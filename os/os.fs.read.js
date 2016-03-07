'use strict';
(function () {

    var MAX_SIZE_PER_READ = 100;

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
    function readFile (filehandle, size, cb) {

        var psname = os._internals.ps.runningProcess.slice(0);

        var realFileHandle = os._internals.fs.disk[filehandle.name].meta;

        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performReadOperation(psname, realFileHandle, size, cb);
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
        console.log("Read Operation: " +psname);

        var entrypoint;
        if (size > MAX_SIZE_PER_READ) {
            // call cb with an error
            entrypoint = function () {
                cb(-1);
            };

        } else {
            // valid request return the data
            entrypoint = function () {
                cb(0, os._internals.fs.disk[filehandle.name].data.substr(filehandle.pos, size));
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
})();