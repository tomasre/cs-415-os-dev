'use strict';
(function(){
    os.bin.checkPermissions = checkPermissions;

    os.ps.register('checkPermissions', checkPermissions, {stdout:true});

    function checkPermissions(options, argv){
		// argv[0] determines if checking for a process ('p') or a file/dir ('f')
		// argv[1] is the process or file/dir
		// argv[2] is read or write ('r' or 'w') if file/dir
        
		var stdout = options.stdout;
		
		var granted = false;

		switch(argv[0]) {
			case 'p':
				granted = checkProcess(argv[1]);
				break;
			case 'f':
				granted = checkFilesystem(argv[1], argv[2]);
				break;
		}
		
		return granted;
    }
	
	function checkProcess(process) {
		
	}
	
	function checkFilesystem(fsObject, opType) {
		// Determine if a read or a write
		var permPos;	// Holds position for r, w, or x (rwx)
		if (opType == 'r')
			permPos = 0;
		else if(opType == 'w')
			permPos = 1;
		
		// Check if it is the file's owner
		if(os._internals.fs.disk[fsObject].acl.owner.user == os._internals.sec.user) {
			if (os._internals.fs.disk[fsObject].acl.owner.permissions.substr(permPos, 1) == opType) {
				console.log("File permission granted");
				return true;
			}
		}
		
		// Otherwise check the group
		var userFound = false;
		for(var i = 0; i < os._internals.fs.disk[fsObject].acl.group.users.length; i++) {
			if(os._internals.fs.disk[fsObject].acl.group.users[i] == os._internals.sec.user) {
				userFound = true;
				break;
			}
		}
		if(userFound) {
			if(os._internals.fs.disk[fsObject].acl.group.permissions.substr(permPos, 1) == opType) {
				console.log("File permission granted");
				return true;
			}
		}
		
		// Otherwise check if universal access is granted
		if(os._internals.fs.disk[fsObject].acl.others.permissions.substr(permPos, 1) == opType) {
			console.log("File permission granted");
			return true;
		}
		
		console.log("File permission denied");
		return false;
	}
})();
