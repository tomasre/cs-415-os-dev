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
(function () {
    os.ps.register('pipe', pipe, null);
	
	function pipe(options, args) {
		var cmd;
		// Make sure to call the appropriate process name
		if(args[1] == 'cat')
			cmd = 'concatenate';
		else
			cmd = args[1];
		os._internals.ps.copyProcessTableEntryToPCB(cmd, 'pipe', args[0]);
	}
})();
