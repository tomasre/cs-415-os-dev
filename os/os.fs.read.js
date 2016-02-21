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

        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performReadOperation(filehandle, size, cb);
                }, generateRandomTimeout());
            },
            // copy string
            processName: os._internals.ps.runningProcess.slice(0)
        });
    }

    /*
     performs the actual read operation on the disk (syncronously) as operation is wrapping it asynchronously
     */
    function performReadOperation(filehandle, size, cb) {
        if (size > MAX_SIZE_PER_READ) {
            // call cb with an error
            cb('size over max size allowed per read operation');
        } else {
            // valid request return the data
            cb(null, os._internals.fs.disk[filehandle.name].data.substr(filehandle.pos, size));
        }
    }

    /*
     generates a random interval between 10 and 100 ms
     */
    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
})();