'use strict';
(function () {
    os.ps.register = registerProcess;

    os._internals.ps.copyProcessTableEntryToPCB = copyProcessTableEntryToPCB;

    /*
    name is the process name
    cliArguments is the array of arguments to pass to the process
    if options are passed in will override the options which got passed in
    when the process regisstered itself via os.ps.register;
    */
    function copyProcessTableEntryToPCB (name, options, cliArguments) {
        var pcbOptions;
        if (!options) {
            pcbOptions = os._internals.ps.processTable[name].options;
        } else if (options == 'pipeIn') {
			os._internals.ps.processTable[name].options.pipeIn = true;
			pcbOptions = os._internals.ps.processTable[name].options;
		} else if (options == 'pipeOut') {
			os._internals.ps.processTable[name].options.pipeOut = true;
			pcbOptions = os._internals.ps.processTable[name].options;
		} else {
            pcbOptions = options;
        }
        generatePCBEntry(name,
            os._internals.ps.processTable[name].cb,
            pcbOptions,
            cliArguments);
    }

    function generatePCBEntry (name, cb, options, args) {
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
        the first entrypoint to get registered will pass in Object and an array of
        cli arguments
        options will have options.stdout, and options.stdin
         */
        pcb.entryPoint = function () {
            if (!args) {
                args = [];
            }
			var pipeInFlag = false;
			var pipeOutFlag = false;
			if(options != null) {
				if(options.hasOwnProperty("pipeIn")) {
					pipeInFlag = options.pipeIn;
				}
				if(options.hasOwnProperty("pipeOut")) {
					pipeOutFlag = options.pipeOut;
				}
			}		
            cb({
                stdin: pcb.streams.stdin,
                stdout: pcb.streams.stdout,
				pipeIn: pipeInFlag,
				pipeOut: pipeOutFlag
            }, args);
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

    /*
    name is the name of the process which is registering itself
    each "process should register a 'main' function with 0 arguments as its entry point"
    options is an optional parameter with the member:
        stdin: listenerFunction
        stdout: true
    this will request it gets bound to the stdin, and register listenerFunction to the stdin stream
     */
    function registerProcess(name, cb, options , man) {
        os._internals.ps.processTable[name] = {
            name: name,
            cb: cb,
            options: options,
            man: man
        };
    }

})();
