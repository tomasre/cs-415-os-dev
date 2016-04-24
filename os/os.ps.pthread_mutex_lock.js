(function() {
    /*
    when the scheduler runs it will move the process which gets the lock from
    requestedLockedProcesses to currentLock, when unlock is called it will remove
    currentLock
    */

    os.ps.pthread_mutex_lock = lock;
    os.ps.pthread_mutex_unlock = unlock;

    function lock(lockName, cb) {
        var process = os._internals.ps.runningProcess.slice(0);

        if (!os._internals.ps.lockedStructures[lockName]) {
            os._internals.ps.lockedStructures[lockName] = {
                requestedLockedProcesses: [],
                currentLock: null,
                data: {}
            }
        }

        os._internals.ps.lockedStructures[lockName].requestedLockedProcesses.push(process);

        // set the processes entrypoint when it is ready to be scheduled
        os._internals.ps.asyncMessageOperationReadyToReturn(
            process,
            // has to be wrapped so the cb doesnt run now
            function () {
                // set the lock
                os._internals.ps.lockedStructures[lockName].currentLock = process;

                cb(os._internals.ps.lockedStructures[lockName].data);
            },
            os._internals.ps.asyncOperationTypes.MUTEX_LOCK
        );
    }


    function unlock(lockName, cb) {
        var process = os._internals.ps.runningProcess.slice(0);

        os._internals.ps.lockedStructures[lockName].currentLock = null;

        // set the processes entrypoint when it is ready to be scheduled
        os._internals.ps.asyncMessageOperationReadyToReturn(
            process,
            // has to be wrapped so the cb doesnt run now
            function () {
                cb();
            },
            os._internals.ps.asyncOperationTypes.MUTEX_LOCK
        );
    }
})();
