'use strict';
(function () {
    os.ps.register = registerProcess;

    /*
    name is the name of the process which is registering itself
    each "process should register a 'main' function with 0 arguments as its entry point"
    options is an optional parameter with the member:
        stdin: listenerFunction
        stdout: true
    this will request it gets bound to the stdin, and register listenerFunction to the stdin stream
     */
    function registerProcess(name, cb, options) {

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

        /*
        attach the display driver if configured
        */
        if (options && options.stdout) {
            pcb.streams.stdout.registerDriver(os._internals.drivers.display.streamUpdateFunction);
        }

        /*
        attach the stream listener if configured
        */
        if (options && options.stdin) {
            pcb.streams.stdin.registerStreamListener(options.stdin, name);
            os._internals.drivers.keyboard.attachStream(pcb.streams.stdin);
        }

        os._internals.ps.pcb.push(pcb);
    }

})();
