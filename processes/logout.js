'use strict';
(function(){
    os.bin.logout = logout;

    os.ps.register('logout', logout, {stdin: logoutListener, stdout:true});
	
	var stdout;

    function logout(options, argv){
		stdout = options.stdout;
		
		stdout.appendToBuffer("Are you sure you want to logout? (y/n)");	
	}
	
	function logoutListener(stream) {
		var buf = stream.consumeBuffer();
		
		// Get the username login
		var input = buf.substr(11, buf.length - 11);
		
		// Get rid of leading blanks
		var i = 0;
		while(i < input.length && input[i] == ' ')
			i++;
		
		// If yes, then log user out and initiate login process
		if(input.toLowerCase() == 'y' || input.toLowerCase() == 'yes') {
			os._internals.sec.curMode = os._internals.sec.modes.NONE;
			os._internals.sec.user = '';
				
			document.getElementById('textArea').innerHTML = "";
			os._internals.drivers.keyboard.deregisterStream();
			os._internals.ps.copyProcessTableEntryToPCB('login');
		}
		else if(input.toLowerCase() == 'n' || input.toLowerCase() == 'no') {
			os._internals.drivers.keyboard.deregisterStream();
		}
		else {
			stdout.appendToBuffer("Incorrect input; either \'y\', \'Y\', \'yes\', \'n\', \'N\', \'no\'");
			stdout.appendToBuffer("Are you sure you want to logout? (y/n)");
		}
	}
})();
