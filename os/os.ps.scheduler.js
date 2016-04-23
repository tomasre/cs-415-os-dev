'use strict';
(function () {

    os._internals.ps.scheduleProcess = scheduleProcess;

    /*
    fsOperationReadyToReturn just calls the asyncMessageOperationReadyToReturn with
    the new parameters, so we dont have to change all the references
    */
    os._internals.ps.fsOperationReadyToReturn = fsOperationReadyToReturn;

    os._internals.ps.asyncMessageOperationReadyToReturn = asyncMessageOperationReadyToReturn;

    /*
     whether or not the scheduler is waiting for disk or some event before running
     */
    var schedulerWaiting = false;

    /*
     either reruns the scheduler instantly again, or if nothing is to be done
     waits for disk to finish before rerunning
     */
    function queueScheduler() {

        if (shouldRescheduleInstantly()) {
            //console.log('queued instantly');
            //console.log(os._internals);
            schedulerWaiting = false;
            setTimeout(function () {
                scheduleProcess();
            }, 0)
        } else {

            schedulerWaiting = true;
        }
    }

    /*
     picks a process from the pcb
     */
    function scheduleProcess () {
        /*
         there is a process to be run if there is at least one process besides the fs process
         in a state of READY or START
         */

        // shift the array so the first one doesnt get chosen too many times in a row
        var elem = os._internals.ps.pcb.shift();
        os._internals.ps.pcb.push(elem);

        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            if (processValidToBeScheduled(process)) {

                //console.log('running: ' + process.name);
                process.state = os._internals.ps.states.RUNNING;
                os._internals.ps.runningProcess = process.name;

                try {
                    /*
                    all process code will log to console.info to be able to filter logs
                    */
                    var consoleBackup = window.console.log;
                    window.console.log = window.console.info;
                    process.entryPoint();
                    window.console.log = consoleBackup;

                    if (process.name !== 'fs') {
                        // treat normally
                        // as of right now the processes is done (or waiting for a filesystem operation
                        if (waitingForFsOp(process.name)) {
                            // change state to waiting
                            process.state = os._internals.ps.states.WAITING;
                            //console.log('waiting for op');
                        } else {
                            //console.log('stopping ' + process.name);
                            //console.log(os._internals);
                            process.state = os._internals.ps.states.STOP;

                            // if it is a thread and its the last running thread
                            if (process.parentName && process.scheduleOnComplete && lastRunningThread(process.parentName)) {
                                process.scheduleOnComplete();
                            }
                        }
                    } else {
                        //console.log('fs ran');
                        process.state = os._internals.ps.states.READY;
                    }
                    // reschedule process or idle until an event
                    queueScheduler();

                } catch (e) {
                    console.log("Crashed");
                    console.log(e);
                    process.state = os._internals.ps.states.STOP;

                    // TODO check if it has outstanding fs operations after crash
                }

                break;
            }
        }

        /*
        returns true if its ready or waiting or its the fs with an open fs operation
         */
        function processValidToBeScheduled(process) {
            if (process.state === os._internals.ps.states.READY || process.state === os._internals.ps.states.START) {
                if (process.name === 'fs' && os._internals.fs.operationQueue.length < 1) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    /*
     returns true if we should reschedule instantly:
     there is a fs operation in the queue, or there is a user process with a READY status
     */
    function shouldRescheduleInstantly() {

        if (os._internals.fs.operationQueue.length > 0) {
            // operation waiting, reschedule
            return true;
        }

        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            if (process.name === 'fs') {
                // ignore if fs is READY
                continue;
            }

            if (process.state === os._internals.ps.states.READY || process.state === os._internals.ps.states.START) {
                return true;
            }
        }

        // none found, no need to reschedule instantly
        return false;
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

            if (process.state !== os._internals.ps.states.STOP) {
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
    just calls asyncMessageOperationReadyToReturn
    */
    function fsOperationReadyToReturn(process, entrypoint) {
        asyncMessageOperationReadyToReturn(
            process,
            entrypoint,
            os._internals.ps.asyncOperationTypes.FS);
    }

    /*
     sets the entrypoint callback as the entrypoint in the pcb for the processName
     also marks it as 'READY' in the pcb
     TODO: rename to asyncMessageOperationReadyToReturn()
     */
    function asyncMessageOperationReadyToReturn(processName, entrypoint, type) {
        // waiting is done, scheduler is ready to be done
        os._internals.ps.waits[type]--;

        var found = false;

        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            if (process.name !== processName) {
                // not the process we need to find
                continue;
            }

            // found the process
            process.entryPoint = entrypoint;
            process.state = os._internals.ps.states.READY;
            found = true;
            break;
        }

        // disk is back, requeue the schedule if needed
        if (schedulerWaiting) {
            //console.log('QUEUEING SCHEUDLER');
            queueScheduler();
        }


        if (!found) {
            // if we got here we didnt find the process - cant recover
            console.log('os.ps.scheduler.fsOperationReadyToReturn ERROR didnt find matching process name for: ' + processName);
        }
    }

    /*
    returns true if there is no other child threads running
    */
    function lastRunningThread(parentName) {
        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];

            if (process.parentName === parentName) {

                // check if there is one which is not at STOP state
                if (process.state === os._internals.ps.states.READY || process.state === os._internals.ps.states.START
                    || process.state === os._internals.ps.states.WAITING) {
                    // there is one which needs to run still
                    return false;
                }
            }
        }

        // didnt find a thread still running
        return true;
    }
})();
