'use strict';
(function () {

    os.ps.register('fs', main);

    /*
    main executes one of the operations in the filesystem queue
    note the entrypoint for this process should never change
    main function should execute every time one wishes a filesystem operation to be performed
     */
    function main () {
        var operation = os._internals.fs.operationQueue.pop();

        if (operation) {
            os.ps.createThread(function () {

                os._internals.ps.waits.fs++;

                operation.operation();

            }, allThreadsFinished);
        }
    }

    function allThreadsFinished() {
        // DONT CARE
    }
})();
