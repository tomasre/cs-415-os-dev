'use strict';
(function(){
    os.bin.chmod = chmod;

    os.ps.register('chmod', chmod, {stdout:true});

    function chmod(options, argv){
		var newPermission = argv[0];
		var theFile = argv[1];
        var onFailMsg ="The file " + theFile + " does not exist";
        var stdout = options.stdout;

		// Look for the file on the disk
		var fileFound;
		var fileObject;
		console.log("theFile = " + theFile);
		if(os._internals.fs.disk.root.home[theFile]) {
			fileFound = true;
			fileObject = os._internals.fs.disk.root.home[theFile];
		}
		else if(os._internals.fs.root.etc.shadow[theFile]) {
			fileFound = true;
			fileObject = os._internals.fs.disk.etc.shadow[theFile];
		}
		else
			fileFound = false;
		
        if(fileFound) {
			var operation = newPermission.substr(1,1);
            // Determine the input
			if(operation == '+' || operation == '-' || operation == '=') {
				
				// Determine the person(s) (owner, group, others, or all)
				var persons = newPermission.substr(0,1);
				
				if(persons == 'u' || persons == 'g' || persons == 'o' || persons == 'a') {
					// Determine the permissions
					var permissions = newPermission.substr(2, newPermission.length-2);
				
					if(permissions == 'r' || permissions == 'w' || permissions == 'rw' || 
					   permissions == 'rwx' || permissions == 'wx' || permissions == 'x') {
						
						// Give the persons(s) the access writes
						if(operation == '+') {		// '+' add
							if(persons == 'u') {		// 'u' user
								if(permissions == 'r')
									fileObject.acl.owner.permissions.substr(0,1) = permissions;
								else if(permissions == 'w')
									fileObject.acl.owner.permissions.substr(1,1) = permissions;
								else if(permissions == 'rw')
									fileObject.acl.owner.permissions.substr(0,2) = permissions;
								else if(permissions == 'rwx')
									fileObject.acl.owner.permissions = permissions;
								else if(permissions == 'wx')
									fileObject.acl.owner.permissions.substr(1,2) = permissions;
								else
									fileObject.acl.owner.permissions.substr(2,1) = permissions;
							}
							else if(persons == 'g') {	// 'g' group
								if(permissions == 'r')
									fileObject.acl.group.permissions.substr(0,1) = permissions;
								else if(permissions == 'w')
									fileObject.acl.group.permissions.substr(1,1) = permissions;
								else if(permissions == 'rw')
									fileObject.acl.group.permissions.substr(0,2) = permissions;
								else if(permissions == 'rwx')
									fileObject.acl.group.permissions = permissions;
								else if(permissions == 'wx')
									fileObject.acl.group.permissions.substr(1,2) = permissions;
								else
									fileObject.acl.group.permissions.substr(2,1) = permissions;
							}
							else if(persons == 'o') {	// others
								if(permissions == 'r')
									fileObject.acl.others.permissions.substr(0,1) = permissions;
								else if(permissions == 'w')
									fileObject.acl.others.permissions.substr(1,1) = permissions;
								else if(permissions == 'rw')
									fileObject.acl.others.permissions.substr(0,2) = permissions;
								else if(permissions == 'rwx')
									fileObject.acl.others.permissions = permissions;
								else if(permissions == 'wx')
									fileObject.acl.others.permissions.substr(1,2) = permissions;
								else
									fileObject.acl.others.permissions.substr(2,1) = permissions;									
							}
							else if(persons == 'a') {	// all
								if(permissions == 'r') {
									fileObject.acl.owner.permissions.substr(0,1) = permissions;
									fileObject.acl.group.permissions.substr(0,1) = permissions;
									fileObject.acl.others.permissions.substr(0,1) = permissions;
								}
								else if(permissions == 'w') {
									fileObject.acl.owner.permissions.substr(1,1) = permissions;
									fileObject.acl.group.permissions.substr(1,1) = permissions;
									fileObject.acl.others.permissions.substr(1,1) = permissions;
								}
								else if(permissions == 'rw') {
									fileObject.acl.owner.permissions.substr(0,2) = permissions;
									fileObject.acl.group.permissions.substr(0,2) = permissions;
									fileObject.acl.others.permissions.substr(0,2) = permissions;
								}
								else if(permissions == 'rwx') {
									fileObject.acl.owmer.permissions = permissions;
									fileObject.acl.group.permissions = permissions;
									fileObject.acl.others.permissions = permissions;
								}
								else if(permissions == 'wx') {
									fileObject.acl.owner.permissions.substr(1,2) = permissions;
									fileObject.acl.group.permissions.substr(1,2) = permissions;
									fileObject.acl.others.permissions.substr(1,2) = permissions;
								}
								else {
									fileObject.acl.owner.permissions.substr(2,1) = permissions;
									fileObject.acl.group.permissions.substr(2,1) = permissions;
									fileObject.acl.others.permissions.substr(2,1) = permissions;									
								}
							}
						}
						else if(operation == '-') {		// '-' remove
							if(persons == 'u') {		// 'u' user
								if(permissions == 'r')
									fileObject.acl.owner.permissions.substr(0,1) = '-';
								else if(permissions == 'w')
									fileObject.acl.owner.permissions.substr(1,1) = '-';
								else if(permissions == 'rw')
									fileObject.acl.owner.permissions.substr(0,2) = '--';
								else if(permissions == 'rwx')
									fileObject.acl.owner.permissions = '---';
								else if(permissions == 'wx')
									fileObject.acl.owner.permissions.substr(1,2) = '--';
								else
									fileObject.acl.owner.permissions.substr(2,1) = '-';
							}
							else if(persons == 'g') {	// 'g' group
								if(permissions == 'r')
									fileObject.acl.group.permissions.substr(0,1) = '-';
								else if(permissions == 'w')
									fileObject.acl.group.permissions.substr(1,1) = '-';
								else if(permissions == 'rw')
									fileObject.acl.group.permissions.substr(0,2) = '--';
								else if(permissions == 'rwx')
									fileObject.acl.group.permissions = '---';
								else if(permissions == 'wx')
									fileObject.acl.group.permissions.substr(1,2) = '--';
								else
									fileObject.acl.group.permissions.substr(2,1) = '-';								
							}
							else if(persons == 'o') {	// others
								if(permissions == 'r')
									fileObject.acl.others.permissions.substr(0,1) = '-';
								else if(permissions == 'w')
									fileObject.acl.others.permissions.substr(1,1) = '-';
								else if(permissions == 'rw')
									fileObject.acl.others.permissions.substr(0,2) = '--';
								else if(permissions == 'rwx')
									fileObject.acl.others.permissions = '---';
								else if(permissions == 'wx')
									fileObject.acl.others.permissions.substr(1,2) = '--';
								else
									fileObject.acl.others.permissions.substr(2,1) = '-';									
							}
							else if(persons == 'a') {	// all
								if(permissions == 'r') {
									fileObject.acl.owner.permissions.substr(0,1) = '-';
									fileObject.acl.group.permissions.substr(0,1) = '-';
									fileObject.acl.others.permissions.substr(0,1) = '-';
								}
								else if(permissions == 'w') {
									fileObject.acl.owner.permissions.substr(1,1) = '-';
									fileObject.acl.group.permissions.substr(1,1) = '-';
									fileObject.acl.others.permissions.substr(1,1) = '-';
								}
								else if(permissions == 'rw') {
									fileObject.acl.owner.permissions.substr(0,2) = '--';
									fileObject.acl.group.permissions.substr(0,2) = '--';
									fileObject.acl.others.permissions.substr(0,2) = '--';
								}
								else if(permissions == 'rwx') {
									fileObject.acl.owmer.permissions = '---';
									fileObject.acl.group.permissions = '---';
									fileObject.acl.others.permissions = '---';
								}
								else if(permissions == 'wx') {
									fileObject.acl.owner.permissions.substr(1,2) = '--';
									fileObject.acl.group.permissions.substr(1,2) = '--';
									fileObject.acl.others.permissions.substr(1,2) = '--';
								}
								else {
									fileObject.acl.owner.permissions.substr(2,1) = '-';
									fileObject.acl.group.permissions.substr(2,1) = '-';
									fileObject.acl.others.permissions.substr(2,1) = '-';									
								}
							}							
						}
						else if(operation == '=') {		// '=' assign
							if(persons == 'u') {		// 'u' user
								if(permissions == 'r')
									fileObject.acl.owner.permissions = 'r--';
								else if(permissions == 'w')
									fileObject.acl.owner.permissions = '-w-';
								else if(permissions == 'rw')
									fileObject.acl.owner.permissions = 'rw-';
								else if(permissions == 'rwx')
									fileObject.acl.owner.permissions = 'rwx';
								else if(permissions == 'wx')
									fileObject.acl.owner.permissions = '-wx';
								else
									fileObject.acl.owner.permissions = '--x';
							}
							else if(persons == 'g') {	// 'g' group
								if(permissions == 'r')
									fileObject.acl.group.permissions = 'r--';
								else if(permissions == 'w')
									fileObject.acl.group.permissions = '-w-';
								else if(permissions == 'rw')
									fileObject.acl.group.permissions = 'rw-';
								else if(permissions == 'rwx')
									fileObject.acl.group.permissions = 'rwx';
								else if(permissions == 'wx')
									fileObject.acl.group.permissions = '-wx';
								else
									fileObject.acl.group.permissions = '--x';								
							}
							else if(persons == 'o') {	// others
								if(permissions == 'r')
									fileObject.acl.others.permissions = 'r--';
								else if(permissions == 'w')
									fileObject.acl.others.permissions = '-w-';
								else if(permissions == 'rw')
									fileObject.acl.others.permissions = 'rw-';
								else if(permissions == 'rwx')
									fileObject.acl.others.permissions = 'rwx';
								else if(permissions == 'wx')
									fileObject.acl.others.permissions = '-wx';
								else
									fileObject.acl.others.permissions = '--x';	
							}
							else if(persons == 'a') {	// all
								if(permissions == 'r') {
									fileObject.acl.owner.permissions = 'r--';
									fileObject.acl.group.permissions = 'r--';
									fileObject.acl.others.permissions = 'r--';
								}
								else if(permissions == 'w') {
									fileObject.acl.owner.permissions = '-w-';
									fileObject.acl.group.permissions = '-w-';
									fileObject.acl.others.permissions = '-w-';
								}
								else if(permissions == 'rw') {
									fileObject.acl.owner.permissions = 'rw-';
									fileObject.acl.group.permissions = 'rw-';
									fileObject.acl.others.permissions = 'rw-';
								}
								else if(permissions == 'rwx') {
									fileObject.acl.owmer.permissions = 'rwx';
									fileObject.acl.group.permissions = 'rwx';
									fileObject.acl.others.permissions = 'rwx';
								}
								else if(permissions == 'wx') {
									fileObject.acl.owner.permissions = '-wx';
									fileObject.acl.group.permissions = '-wx';
									fileObject.acl.others.permissions = '-wx';
								}
								else {
									fileObject.acl.owner.permissions = '--x';
									fileObject.acl.group.permissions = '--x';
									fileObject.acl.others.permissions = '--x';									
								}
							}							
						}
						console.log("fileObject.acl.owner.permissions = " + fileObject.acl.owner.permissions);
						console.log("fileObject.acl.group.permissions = " + fileObject.acl.group.permissions);
						console.log("fileObject.acl.others.permissions = " + fileObject.acl.others.permissions);
					}
					else
						stdout.appendToBuffer("Not valid permission(s); must be r, rw, rwx, wx, or x");
					}
					else
						stdout.appendToBuffer("Not valid person(s); must be u for owner, g for group, o for others, or a for all");
				}
				else
					stdout.appendToBuffer("Not a valid operator; must be +, -, or =");
        } else {
            console.log(onFailMsg);
            stdout.appendToBuffer(onFailMsg);
        }
    }
})();
