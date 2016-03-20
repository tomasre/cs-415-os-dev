'use strict';
(function () {
    // start 2 processes by default: cli and fs
    os._internals.ps.copyProcessTableEntryToPCB('fs');
    os._internals.ps.copyProcessTableEntryToPCB('Bash');
    //os._internals.ps.copyProcessTableEntryToPCB('vectorCalculator');


    // actually start the execution of the processes!
    os._internals.ps.scheduleProcess();
})();
