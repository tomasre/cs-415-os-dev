'use strict';

(function() {
    /*
    when the scheduler runs it will move the process which gets the lock from
    requestedLockedProcesses to currentLock, when unlock is called it will remove
    currentLock
    */

    os.ps.pthread_semaphore_lock = semaphore_lock;
    os.ps.pthread_semaphore_unlock = semaphore_unlock;

    function semaphore_lock(lockName, cb) {
        var process = os._internals.ps.runningProcess.slice(0);

        // add entry to pcb about waiting for mutexLock
        var pcbEntry = getPCBEntry(process);
        if (!pcbEntry.semaphoreCount) {
            // create if not created
            pcbEntry.semaphoreCount = 0;
        }

        pcbEntry.semaphoreCount++;

        if (!os._internals.ps.lockedStructures[lockName]) {
            os._internals.ps.lockedStructures[lockName] = {
                requestedLockedProcesses: [],
                currentLock: null,
                data: {},
                semaphoreStatus: 0
            }
        }
        else if (!os._internals.ps.lockedStructures[lockName].semaphoreStatus) {
            os._internals.ps.lockedStructures[lockName].semaphoreStatus = 0;
        }

        os._internals.ps.lockedStructures[lockName].requestedLockedProcesses.push(process);

        // set the processes entrypoint when it is ready to be scheduled
        os._internals.ps.asyncMessageOperationReadyToReturn(
            process,
            // has to be wrapped so the cb doesnt run now
            function () {
                // set the lock
                os._internals.ps.lockedStructures[lockName].currentLock = process;
                os._internals.ps.lockedStructures[lockName].semaphoreStatus--;
                cb(os._internals.ps.lockedStructures[lockName].data);
            },
            os._internals.ps.asyncOperationTypes.SEMAPHORE_LOCK
        );
    }


    function semaphore_unlock(lockName, cb) {
        var process = os._internals.ps.runningProcess.slice(0);

        os._internals.ps.lockedStructures[lockName].currentLock = null;

        var pcbEntry = getPCBEntry(process);

        // set the processes entrypoint when it is ready to be scheduled
        os._internals.ps.asyncMessageOperationReadyToReturn(
            process,
            // has to be wrapped so the cb doesnt run now
            function () {
                cb();
                pcbEntry.semaphoreCount--;
                os._internals.ps.lockedStructures[lockName].semaphoreStatus++;
            },
            os._internals.ps.asyncOperationTypes.SEMAPHORE_LOCK
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

        console.log('Semaphore lock get pcb entry SHOULD NEVER HAPPEN PANIC');
        return null;
    }
})();
