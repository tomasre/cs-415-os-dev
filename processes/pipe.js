/*
	Right now ls, ps, and help can pipe into either more or cat.
	Still need to add logic to pipe exec process outputs into either more or cat or another exec process.
	Still need to add logic to pipe out man
	Changes made:
		Bash.js:					'ls', 'ps', and 'help' functions now have branches to determine if branch 
									operator found and calls the pipe function with the appropriate args
		os.ps.registerProcess.js:	CopyProcessTableEntryToPCB function now checks 'options' parameter checked in
									to see if it is 'pipe'; if so, it's just like null, the options gets the registered
									option object for that process, but sets the new member pipe to true (flag to tell
									process to take input from pipe and not open the file).
									entryPoint function now checks pipe flag; if true, sends pipe flag to callback as true.
		processes(more, cat):		Process registration now includes a flag member in options object, defaults to false.
									Beginning of functions now check pipe flag in options object; if true, trickles through
									waterfall fs ops essentially bypassing them by sending the direct string through to the 
									functions that deal with the "fully read" data.  So for each fs op function, there is a 
									branch at the beginning to check if the pipe is true, in which case it will call the next
									waterfall function immediately with the data.
									In these functions that process the fullData, after the code to split the string into anchor
									array based on "\n", there is now code to split it if it's "<br>" when piped in.
									Finally, at end of these functions, there is a branch to check if pipe is true; if so, will
									reset pipe flag in registered options; if not, will call fs close waterfall function.
*/

'use strict';

var pipeBuffer = "";
(function () {
    os.ps.register('pipeIn', pipeIn, {stdout: true});
	
	os._internals.ps.pipeOutputToBuffer = pipeOutputToBuffer;
	
	function pipeIn(options, args) {
		var stdout = options.stdout;
		var cmd;

		// Make sure to call the appropriate process name
		if(args[0] == 'exec') {
			cmd = args[1];
			if(args[2] != undefined && args[2] != '|') {
				var temp = pipeBuffer;
				pipeBuffer = [temp, args[2]];
			}
		}
		else if(args[0] == 'cat')
			cmd = 'concatenate';
		else if(args[0] == 'more')
			cmd = 'more';
		else {
			// Invalid command
			stdout.appendToBuffer(args[0] + ": Invalid command");
			return;
		}
		os._internals.ps.copyProcessTableEntryToPCB(cmd, 'pipeIn', pipeBuffer);
	}
	
	function pipeOutputToBuffer(output) { 
		pipeBuffer = output;
	}
})();

(function () {
    os.ps.register('pipeOut', pipeOut, {stdout: true});
	
	os._internals.ps.pipeInputToBuffer = pipeInputToBuffer;
	
	var bufferArgs;
	
	function pipeOut(options, args) {
		var cmd;

		// Make sure to call the appropriate process name
		if(args[0] == 'exec') {
			// If exec, execute the program in pipeOut mode
			os.ps.pthread_mutex_lock('pipeOut', function (lockedData) {
				console.log("pipeOut lock");
				bufferArgs = args;
				if(args[1] == 'ContactManager')
					os._internals.ps.copyProcessTableEntryToPCB(args[1], 'pipeOut', args.slice(2));
				else
					os._internals.ps.copyProcessTableEntryToPCB(args[1], 'pipeOut', [args[2]]);
			});
		}
		else {
			// Invalid command
			stdout.appendToBuffer(args[0] + ": Invalid command");
			return;			
		}
	}
	
	function pipeInputToBuffer(input) { 
		pipeBuffer = input;
		
		// Input recieved; unlock pipeOut and call the program to pipe the buffered input to
		os.ps.pthread_mutex_unlock('pipeOut', function () {
			console.log("pipeOut unlock");
			if(bufferArgs[1] == 'ContactManager')
				os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, bufferArgs.slice(5));
			else
				os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, bufferArgs.slice(4));	
		});
	}
})();
