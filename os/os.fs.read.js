'use strict';
(function () {
    os.fs.read = readFile;

    function readFile (cb) {
        console.log('READ');
        cb(null, 'fuck');

        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performReadOperation(cb);
                }, generateRandomTimeout());
            },
            // copy string
            processName: os._internals.ps.runningProcess.slice(0)
        });
    }

    /*
     performs the actual read operation on the disk
     */
    function performReadOperation(cb) {

    }

    /*
     generates a random interval between 10 and 100 ms
     */
    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }
})();