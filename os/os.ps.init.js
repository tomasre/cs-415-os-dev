'use strict';
(function () {


    console.log('OS STATE BEFORE INIT');
    console.log(JSON.parse(JSON.stringify(os)));
    // actually start the execution of the processes!
    os._internals.ps.scheduleProcess();
})();