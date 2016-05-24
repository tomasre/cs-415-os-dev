'use strict';
(function () {
    // start 2 processes by default: cli and fs
    os._internals.ps.copyProcessTableEntryToPCB('fs');
    os._internals.ps.copyProcessTableEntryToPCB('Bash');
    os._internals.ps.copyProcessTableEntryToPCB('loadGroups');
    os._internals.ps.copyProcessTableEntryToPCB('login');
    //os._internals.ps.copyProcessTableEntryToPCB('vectorCalculator');
    //os._internals.ps.copyProcessTableEntryToPCB('ThreadTest', null, ['argument', 'argument2']);
    //os._internals.ps.copyProcessTableEntryToPCB('DeviceDriverTest', null, ['argument', 'argument2']);
    // actually start the execution of the processes!
    os._internals.ps.scheduleProcess();
    os._internals.sec.curMode = os._internals.sec.modes.NONE;
})();
