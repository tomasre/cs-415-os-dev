'use strict';

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

        // add entry to pcb about waiting for mutexLock
        var pcbEntry = getPCBEntry(process);
        if (!pcbEntry.mutexCount) {
            // create if not created
            pcbEntry.mutexCount = 0;
        }

        pcbEntry.mutexCount++;

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

        var pcbEntry = getPCBEntry(process);

        // set the processes entrypoint when it is ready to be scheduled
        os._internals.ps.asyncMessageOperationReadyToReturn(
            process,
            // has to be wrapped so the cb doesnt run now
            function () {
                cb();
                pcbEntry.mutexCount--;
            },
            os._internals.ps.asyncOperationTypes.MUTEX_LOCK
        );
    }

    // returns ref to PCB entry
    function getPCBEntry(processName) {
        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];

            if (process.name === processName) {
                return process;
            }
        }

        console.log('mutex lock get pcb entry SHOULD NEVER HAPPEN PANIC');
        return null;
    }
})();
