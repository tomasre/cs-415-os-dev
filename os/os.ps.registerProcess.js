'use strict';
(function () {
    os.ps.register = registerProcess;

    /*
    name is the name of the process which is registering itself
    each "process should register a 'main' function with 0 arguments as its entry point"
     */
    function registerProcess(name, cb) {

        var pcb = {
            id: os._internals.ps.pcb.length,
            name: name,
            state: os._internals.ps.states.START,
            streams: {
                stdin: new os._internals.stream.writeable(),
                stdout: new os._internals.stream.writeable()
            }
        };

        /*
        the first entrypoint to get registered will pass in stdout and stdin
         */
        pcb.entryPoint = function () {
            cb(pcb.streams.stdout, pcb.streams.stdin);
        };

        // for testing attaching all stdout instances to display driver
        pcb.streams.stdout.registerDriver(os._internals.drivers.display.streamUpdateFunction);
        pcb.streams.stdin.registerDriver(os._internals.drivers.keyboard.keyboardInputFunction);
        os._internals.ps.pcb.push(pcb);
    }

})();