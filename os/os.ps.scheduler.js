'use strict';
(function () {

    os._internals.ps.scheduleProcess = scheduleProcess;

    os._internals.ps.fsOperationReadyToReturn = fsOperationReadyToReturn;

    /*
     picks a process from the pcb
     */
    function scheduleProcess () {
        /*
        there is a process to be run if there is at least one process besides the fs process
        in a state of READY or START
         */
        if (allProcessesDone()) {
            console.log('OS DONE');
            return;
        }

        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            if (process.state === os._internals.ps.states.READY || process.state === os._internals.ps.states.START){

                // run the process after next tick
                setTimeout(function () {
                    try {
                        process.entryPoint();

                        // as of right now the processes is done (or waiting for a filesystem operation
                        if (waitingForFsOp(process.name)) {
                            // change state to waiting
                            process.state = os._internals.ps.states.WAITING;
                        } else {
                            process.state = os._internals.ps.states.STOP;
                        }

                        setTimeout(function () {
                            // TODO what if all processes are waiting for fs and fs is waiting for disk
                            scheduleProcess();
                        }, 1);

                    } catch (e) {
                        console.log("Crashed");
                        console.log(e);
                        process.state = os._internals.ps.states.STOP;

                        // TODO check if it has outstanding fs operations after crash
                    }
                }, 0);

                process.state = os._internals.ps.states.RUNNING;
                os._internals.ps.runningProcess = process.name;
            }
        }
    }

    /*
    returns true if all processes besides the fs are in the state: STOP
    returns false if at least one should be run
     */
    function allProcessesDone() {
        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            if (process.name === 'fs') {
                continue;
            }

            if (process.state === os._internals.ps.states.READY || process.state === os._internals.ps.states.START) {
                return false;
            }
        }

        return true;
    }

    /*
    returns true if process name is waiting for an op
    false if it is not waiting for an op
     */
    function waitingForFsOp(processName) {
        for (var i = 0; i < os._internals.fs.operationQueue.length; i++) {
            var operation = os._internals.fs.operationQueue[i];
            if (operation.processName === processName) {
                return true;
            }
        }
        return false;
    }

    /*
    sets the entrypoint callback as the entrypoint in the pcb for the processName
    also marks it as 'READY' in the pcb
     */
    function fsOperationReadyToReturn(processName, entrypoint) {
        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            if (process.name !== processName) {
                // not the process we need to find
                continue;
            }

            // found the process
            process.entryPoint = entrypoint;
            process.state = os._internals.ps.states.READY;
            return;
        }

        // if we got here we didnt find the process - cant recover
        console.log('os.ps.scheduler.fsOperationReadyToReturn ERROR didnt find matching process name for: ' + processName);
    }
})();