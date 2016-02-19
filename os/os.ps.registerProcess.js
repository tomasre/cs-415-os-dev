'use strict';
(function () {
    os.ps.register = registerProcess;

    /*
    name is the name of the process which is registering itself
    each "process should register a 'main' function with 0 arguments as its entry point"
     */
    function registerProcess(name, cb) {

        os._internals.pcb.push({
            id: os._internals.pcb.length,
            name: name,
            state: os._internals.ps.state.START,
            entryPoint: cb
        });
    }

})();