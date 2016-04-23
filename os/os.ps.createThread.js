'use strict';
(function () {
    os.ps.createThread = createThread;

    function createThread(runnableFunction, onComplete) {

        var onThreadFinish;

        var parentName = os._internals.ps.runningProcess;

        // name is parent name + thread + random component
        var name = parentName + '_thread_' + Math.floor(Math.random() * 10000);

        /*
         REGISTER THE ACTUAL PARENT PROCESS ONCOMPLETE TO BE RUN WHEN ITS DONE
         NOTE: onThreadFinish doenst do anything sync so it can be run sync by the scheduler
         */
        onThreadFinish = function () {
            os._internals.ps.asyncMessageOperationReadyToReturn(
                parentName,
                // THIS IS RUNNING THE ACTUAL PARENT PROCESS NAME
                function () {
                    onComplete(name)
                },
                os._internals.ps.asyncOperationTypes.THREAD_COMPLETE);
        };

        generateLightPCBEntry(name, runnableFunction, onThreadFinish);

        return name;

    }

    function generateLightPCBEntry(threadName, runnable, onThreadFinish) {

        var parentName = os._internals.ps.runningProcess;

        var pcb = {
            id: os._internals.ps.pcb.length,
            name: threadName,
            state: os._internals.ps.states.START,
            parentName: parentName,
            entryPoint: runnable,
            scheduleOnComplete: onThreadFinish
        };
        
        // schedule the thread
        os._internals.ps.pcb.push(pcb);
    }

})();
