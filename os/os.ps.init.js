'use strict';
(function () {


    console.log('OS STATE BEFORE INIT');
    console.log(os);

    // actually start the execution of the processes!
    os._internals.ps.scheduleProcess();
})();