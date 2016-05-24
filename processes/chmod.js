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
        if(os._internals.fs.disk[argv[1]]) {
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
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,1) = permissions;
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,1) = permissions;
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,2) = permissions;
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.owner.permissions = permissions;
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,2) = permissions;
								else
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(2,1) = permissions;
							}
							else if(persons == 'g') {	// 'g' group
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,1) = permissions;
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,1) = permissions;
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,2) = permissions;
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.group.permissions = permissions;
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,2) = permissions;
								else
									os._internals.fs.disk[theFile].acl.group.permissions.substr(2,1) = permissions;
							}
							else if(persons == 'o') {	// others
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,1) = permissions;
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,1) = permissions;
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,2) = permissions;
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.others.permissions = permissions;
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,2) = permissions;
								else
									os._internals.fs.disk[theFile].acl.others.permissions.substr(2,1) = permissions;									
							}
							else if(persons == 'a') {	// all
								if(permissions == 'r') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,1) = permissions;
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,1) = permissions;
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,1) = permissions;
								}
								else if(permissions == 'w') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,1) = permissions;
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,1) = permissions;
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,1) = permissions;
								}
								else if(permissions == 'rw') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,2) = permissions;
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,2) = permissions;
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,2) = permissions;
								}
								else if(permissions == 'rwx') {
									os._internals.fs.disk[theFile].acl.owmer.permissions = permissions;
									os._internals.fs.disk[theFile].acl.group.permissions = permissions;
									os._internals.fs.disk[theFile].acl.others.permissions = permissions;
								}
								else if(permissions == 'wx') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,2) = permissions;
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,2) = permissions;
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,2) = permissions;
								}
								else {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(2,1) = permissions;
									os._internals.fs.disk[theFile].acl.group.permissions.substr(2,1) = permissions;
									os._internals.fs.disk[theFile].acl.others.permissions.substr(2,1) = permissions;									
								}
							}
						}
						else if(operation == '-') {		// '-' remove
							if(persons == 'u') {		// 'u' user
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,1) = '-';
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,1) = '-';
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,2) = '--';
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.owner.permissions = '---';
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,2) = '--';
								else
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(2,1) = '-';
							}
							else if(persons == 'g') {	// 'g' group
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,1) = '-';
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,1) = '-';
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,2) = '--';
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.group.permissions = '---';
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,2) = '--';
								else
									os._internals.fs.disk[theFile].acl.group.permissions.substr(2,1) = '-';								
							}
							else if(persons == 'o') {	// others
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,1) = '-';
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,1) = '-';
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,2) = '--';
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.others.permissions = '---';
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,2) = '--';
								else
									os._internals.fs.disk[theFile].acl.others.permissions.substr(2,1) = '-';									
							}
							else if(persons == 'a') {	// all
								if(permissions == 'r') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,1) = '-';
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,1) = '-';
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,1) = '-';
								}
								else if(permissions == 'w') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,1) = '-';
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,1) = '-';
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,1) = '-';
								}
								else if(permissions == 'rw') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(0,2) = '--';
									os._internals.fs.disk[theFile].acl.group.permissions.substr(0,2) = '--';
									os._internals.fs.disk[theFile].acl.others.permissions.substr(0,2) = '--';
								}
								else if(permissions == 'rwx') {
									os._internals.fs.disk[theFile].acl.owmer.permissions = '---';
									os._internals.fs.disk[theFile].acl.group.permissions = '---';
									os._internals.fs.disk[theFile].acl.others.permissions = '---';
								}
								else if(permissions == 'wx') {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(1,2) = '--';
									os._internals.fs.disk[theFile].acl.group.permissions.substr(1,2) = '--';
									os._internals.fs.disk[theFile].acl.others.permissions.substr(1,2) = '--';
								}
								else {
									os._internals.fs.disk[theFile].acl.owner.permissions.substr(2,1) = '-';
									os._internals.fs.disk[theFile].acl.group.permissions.substr(2,1) = '-';
									os._internals.fs.disk[theFile].acl.others.permissions.substr(2,1) = '-';									
								}
							}							
						}
						else if(operation == '=') {		// '=' assign
							if(persons == 'u') {		// 'u' user
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.owner.permissions = 'r--';
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.owner.permissions = '-w-';
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.owner.permissions = 'rw-';
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.owner.permissions = 'rwx';
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.owner.permissions = '-wx';
								else
									os._internals.fs.disk[theFile].acl.owner.permissions = '--x';
							}
							else if(persons == 'g') {	// 'g' group
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.group.permissions = 'r--';
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.group.permissions = '-w-';
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.group.permissions = 'rw-';
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.group.permissions = 'rwx';
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.group.permissions = '-wx';
								else
									os._internals.fs.disk[theFile].acl.group.permissions = '--x';								
							}
							else if(persons == 'o') {	// others
								if(permissions == 'r')
									os._internals.fs.disk[theFile].acl.others.permissions = 'r--';
								else if(permissions == 'w')
									os._internals.fs.disk[theFile].acl.others.permissions = '-w-';
								else if(permissions == 'rw')
									os._internals.fs.disk[theFile].acl.others.permissions = 'rw-';
								else if(permissions == 'rwx')
									os._internals.fs.disk[theFile].acl.others.permissions = 'rwx';
								else if(permissions == 'wx')
									os._internals.fs.disk[theFile].acl.others.permissions = '-wx';
								else
									os._internals.fs.disk[theFile].acl.others.permissions = '--x';	
							}
							else if(persons == 'a') {	// all
								if(permissions == 'r') {
									os._internals.fs.disk[theFile].acl.owner.permissions = 'r--';
									os._internals.fs.disk[theFile].acl.group.permissions = 'r--';
									os._internals.fs.disk[theFile].acl.others.permissions = 'r--';
								}
								else if(permissions == 'w') {
									os._internals.fs.disk[theFile].acl.owner.permissions = '-w-';
									os._internals.fs.disk[theFile].acl.group.permissions = '-w-';
									os._internals.fs.disk[theFile].acl.others.permissions = '-w-';
								}
								else if(permissions == 'rw') {
									os._internals.fs.disk[theFile].acl.owner.permissions = 'rw-';
									os._internals.fs.disk[theFile].acl.group.permissions = 'rw-';
									os._internals.fs.disk[theFile].acl.others.permissions = 'rw-';
								}
								else if(permissions == 'rwx') {
									os._internals.fs.disk[theFile].acl.owmer.permissions = 'rwx';
									os._internals.fs.disk[theFile].acl.group.permissions = 'rwx';
									os._internals.fs.disk[theFile].acl.others.permissions = 'rwx';
								}
								else if(permissions == 'wx') {
									os._internals.fs.disk[theFile].acl.owner.permissions = '-wx';
									os._internals.fs.disk[theFile].acl.group.permissions = '-wx';
									os._internals.fs.disk[theFile].acl.others.permissions = '-wx';
								}
								else {
									os._internals.fs.disk[theFile].acl.owner.permissions = '--x';
									os._internals.fs.disk[theFile].acl.group.permissions = '--x';
									os._internals.fs.disk[theFile].acl.others.permissions = '--x';									
								}
							}							
						}
						console.log("os._internals.fs.disk[theFile].acl.owner.permissions = " + os._internals.fs.disk[theFile].acl.owner.permissions);
						console.log("os._internals.fs.disk[theFile].acl.group.permissions = " + os._internals.fs.disk[theFile].acl.group.permissions);
						console.log("os._internals.fs.disk[theFile].acl.others.permissions = " + os._internals.fs.disk[theFile].acl.others.permissions);
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
