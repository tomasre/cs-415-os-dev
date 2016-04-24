(function() {
    os.ps.pthread_mutex_lock = lock;
    os.ps.pthread_mutex_unlock = unlock;

    function lock (lockName, cb){
        var process = os._internals.ps.runningProcess.slice(0);


        if(!os._internals.ps.lockedStructures[lockName]){
            os._internals.ps.lockedStructures[lockName] = {
                requestedLockedProcesses: [],
                currentLock: process,
                //TODO  Need to discuss where the data will be
                data: ""
            }
        } else {
            // if there is already a lock it pushes the process to the que
            if(os._internals.ps.lockedStructures[lockName].currentLock) {
                os._internals.ps.lockedStructures[lockName].requestedLockedProcesses.push(process);
            } else {
                // ?? pretty sure this will allow data to be altered but you have to
                // check thomas i do not know js as well as you
                cb(os._internals.ps.lockedStructures[lockName].data);
            }
        }
    }

    // not really sure what you had in mind for the queue.. i thought the
    function unlock (lockName, cb) {
        os._internals.ps.lockedStructures[lockName].currentLock = null;
        cb();
    }
})();