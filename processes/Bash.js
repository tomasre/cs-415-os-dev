'use strict';

(function () {
    var indent = "     ";
    var options = {
        stdin: streamListener,
        stdout: true
    };

    /*
    Note: streamListener is defined outside of main so it does not have access
    to stdout which is defined in main
    therefore we are storing a reference here
    */
    var stdout;

    os.ps.register('Bash', main, options);

    function main(options, argv) {
        stdout = options.stdout;
        console.log('BASH starting');

    }

    function streamListener (stream) {
        //trims prompt there is a better way to do this for now
        var buf = stream.consumeBuffer();
        console.log('BASH consuming buffer');
        var command = buf.replace('dummy@OS $ ', "").split(' ');
        stdout.appendToBuffer(buf);
        console.log(buf);

        //currently they just all call the ls function
        // need more info on how we are going to handle arugment
        //
        switch(command[0]){
            case "ls": // need to figure out how to play with the streams
                var response = Object.getOwnPropertyNames(os._internals.fs.disk).join("<br>");
				
				// Determine if ls should be piped to other process; if not, print to console
				if(command[1] == "|" && command[1] != undefined) {
					if(command[2] == undefined)
						console.log("pipe redirection error; no process for input");
					else {
						os._internals.ps.pipeOutputToBuffer(response);
						os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, command.slice(2));
					}
				}
				else
					stdout.appendToBuffer(response);
                break;

            case "copy": //copy is finished
                os._internals.ps.copyProcessTableEntryToPCB('copy', null, [command[1], command[2]]);
                //os.ps.register('copy',os.bin.copy(command[1],command[2]));
                stdout.appendToBuffer('Copying' +command[1]+' to destination ' + command[2]);
                break;

            case "rm":
                os._internals.ps.copyProcessTableEntryToPCB('remove', null, [command[1]]);
                stdout.appendToBuffer("removing " +command[1]);
                break;

            // for now hardcoded
            case "vectorcalculator":
                os._internals.ps.copyProcessTableEntryToPCB('vectorcalculator');
                //os.ps.register('vectorcalculator', os.bin.vectorcalculator);
                stdout.appendToBuffer('Running VectorCalculator.js');
                break;

            case "countchars":
                os.internals.ps.copyProcessTableEntryToPCB('countchars');
                stdout.appendToBuffer('Running CountChars.js');
                break;

            // for now hardcoded
            case "drivertest":
                os._internals.ps.copyProcessTableEntryToPCB('DeviceDriverTest');
                //os.ps.register('vectorcalculator', os.bin.vectorcalculator);
                stdout.appendToBuffer('Running ddrivertest.js');
                break;

            case "threadtest":
                os._internals.ps.copyProcessTableEntryToPCB('ThreadTest', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running ddrivertest.js');
                break;

            case "mutextest":
                os._internals.ps.copyProcessTableEntryToPCB('MutexTest', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running mutextest.js');
                break;
                
            case "philosophers":
                os._internals.ps.copyProcessTableEntryToPCB('DiningPhilosophers', null, ['argument', 'argument2']);
                break;

            case "semaphoretest":
                os._internals.ps.copyProcessTableEntryToPCB('SemaphoreTest', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running semaphoretest.js');
                break;



            case "statscalc":
                os._internals.ps.copyProcessTableEntryToPCB('StatsCalc', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running StatsCalc.js');
                break;


            case "cat":
                os._internals.ps.copyProcessTableEntryToPCB('concatenate', null, [command[1]]);
                //stdout.appendToBuffer(response);
                break;

            case "exec":
                if(os._internals.ps.processTable[command[1]]){
					// Determine if ls should be piped to other process; if not, print to console
					if(command[3] == "|" && command[3] != undefined) {
						if(command[4] == undefined)
							console.log("pipe redirection error; no process for input");
						else {
							os._internals.ps.copyProcessTableEntryToPCB('pipeOut', null, command);
						}
					}
					else if(command[4] == "|" && command[4] != undefined) {
						if(command[5] == undefined)
							console.log("pipe redirection error; no process for input");
						else {
							os._internals.ps.copyProcessTableEntryToPCB('pipeOut', null, command);
						}
					}
					else {
						var args = command.slice(2,command.length);
						os._internals.ps.copyProcessTableEntryToPCB(command[1],null,args);
					}
                } else {
                    stdout.appendToBuffer("invalid command");
                }
                break;
                
            case "kill":
            // TODO: change logic
                if (command.length === 1)
                    stdout.appendToBuffer("kill: Missing argument");
                else {
                    var pcb = os._internals.ps.pcb;
                    var i;
                    for (i = 0; i < pcb.length; i++) {
                        if (pcb[i].id === command[1])
                            os._internals.ps.pcb[i].state = os._internals.ps.states.STOP;
                        break;
                    }
                    if (i === pcb.length)
                        stdout.appendToBuffer("kill: Process not found");
                }
                break;
            case "ps":
                var pcb = os._internals.ps.pcb;
                var ps = "PID&nbsp;&nbsp;Name<br>";
                for (var i = 0; i < pcb.length; i++) {
                    if (pcb[i].state === os._internals.ps.states.RUNNING ||
                        pcb[i].state === os._internals.ps.states.WAITING)
                        ps += "&nbsp;&nbsp;" + pcb[i].id.toString() + "&nbsp;&nbsp;" + pcb[i].name + "<br>";
                }
				
				// Determine if ps should be piped to other process; if not, print to console
				if(command[1] == "|" && command[1] != undefined) {
					if(command[2] == undefined)
						console.log("pipe redirection error; no process for input");
					else {
						os._internals.ps.pipeOutputToBuffer(ps);
						os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, command.slice(2));
					}
				}
				else
					stdout.appendToBuffer(ps);
                break;

            case "more":
                os._internals.ps.copyProcessTableEntryToPCB('more', null, command[1]);
                break;
            case "clear":
                document.getElementById('textArea').innerHTML = "";
                break;
            case "help":
				var help = "Available Programs-----<br>";
                var cliCommands = Object.getOwnPropertyNames(os._internals.ps.processTable);
                for(var x in cliCommands){
                    help += cliCommands[x];
					help += "<br>";
                }
                help += "To Run a User Process Type<br>";
                help += "exec (process) (args) <br>";
				help += "for more info type man (process)";
				
				// Determine if help should be piped to other process; if not, print to console
				if(command[1] == "|" && command[1] != undefined) {
					if(command[2] == undefined)
						console.log("pipe redirection error; no process for input");
					else {
						os._internals.ps.pipeOutputToBuffer(help);
						os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, command.slice(2));
					}
				}
				else				
					stdout.appendToBuffer(help);
                break;

            // manual now implemented
            case "man":
                if(os._internals.ps.processTable[command[1]]){
					
			// Determine if man should be piped to other process; if not, print to console
			if(command[2] == "|" && command[2] != undefined) {
				if(command[3] == undefined)
					console.log("pipe redirection error; no process for input");
				else {
					os._internals.ps.pipeOutputToBuffer(os._internals.ps.processTable[command[1]].man);
					os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, command.slice(3));
				}
			}
			else	
				stdout.appendToBuffer(os._internals.ps.processTable[command[1]].man);
                }
                break;
            case "Audio_Player":
                os._internals.ps.copyProcessTableEntryToPCB('Audio_Player', null, ["Audio Player"]);

        }
    }



})();
