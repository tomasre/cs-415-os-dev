'use strict';

(function () {
    var pwd = {
        currentDirectory: os._internals.fs.disk.root,
        string: "root/"
    };
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
        stdout.appendToBuffer("dummyOS &copy;2016 Tomas Re, Logan Figgins, Matt Kindblad, Edwin Young, Darrel Daquigan");
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
            case "ls": // merged branch

                var response = Object.getOwnPropertyNames(pwd.currentDirectory).join("<br>");

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

            case "copy"://copy is finished
                if(checkPermissions(command[1], 'r')===false){
                    stdout.appendToBuffer('Access Denied');
                    break;
                }
                var sourcePath = convertToAbsolute(command[1]);
                var destinationPath = convertToAbsolute(command[2]);
                if(validPath(path)) {
                    os._internals.ps.copyProcessTableEntryToPCB('copy', null, [sourcePath, destinationPath]);
                    //os.ps.register('copy',os.bin.copy(command[1],command[2]));
                    stdout.appendToBuffer('Copying' + command[1] + ' to destination ' + command[2]);
                }
                break;

            case "rm":
                var path = convertToAbsolute(command[1]);
                if(validPath(path)) {
                    os._internals.ps.copyProcessTableEntryToPCB('remove', null, [path]);
                }
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

            case "Audio_Player":
                os._internals.ps.copyProcessTableEntryToPCB('Audio_Player', null, ["Audio Player"]);
                break;

            case "su":
                stdout.appendToBuffer('type su for root access');
                os._internals.ps.copyProcessTableEntryToPCB('login');
                break;

            case "cat":
                if(checkPermissions(command[1], 'r')===false){
                    stdout.appendToBuffer('Access Denied');
                    break;
                }
                var path = convertToAbsolute(command[1]);
                if(validPath(path)) {
                    os._internals.ps.copyProcessTableEntryToPCB('concatenate', null, [path]);
                }
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
                if(checkPermissions(command[1], 'r')===false){
                    stdout.appendToBuffer('Access Denied');
                    break;
                }
                var path = convertToAbsolute(command[1]);
                os._internals.ps.copyProcessTableEntryToPCB('more', null, path);
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
				    if(command[3] == undefined) {
                        console.log("pipe redirection error; no process for input");
                    } else {
					    os._internals.ps.pipeOutputToBuffer(os._internals.ps.processTable[command[1]].man);
					    os._internals.ps.copyProcessTableEntryToPCB('pipeIn', null, command.slice(3));
				    }
                break;
			    }
			    else
				stdout.appendToBuffer(os._internals.ps.processTable[command[1]].man);
                }
                break;

            case "cd":
                changeDirectory(command[1]);
                break;

            case "mkdir":
                console.log("mkdir Command");
                var path = convertToAbsolute(command[1]);
                console.log("Path: " + path);

                os._internals.ps.copyProcessTableEntryToPCB('mkDir', null, path);

                break;

            case "pwd":
                stdout.appendToBuffer(pwd.string);
                break;
            case "useradd":
		os._internals.ps.copyProcessTableEntryToPCB('useradd', null, command[1]);
		break;
	    case "userdel":
		os._internals.ps.copyProcessTableEntryToPCB('userdel', null, command[1]);
		break;
	    case "passwd":
		os._internals.ps.copyProcessTableEntryToPCB('passwd', null, command[1]);
		break;
	    case "login":
		if(os._internals.sec.user == '')
			os._internals.ps.copyProcessTableEntryToPCB('login');
		else
			os._internals.ps.copyProcessTableEntryToPCB('logout');
		break;
	    case "logout":
		os._internals.ps.copyProcessTableEntryToPCB('logout');
		break;
	    case "groupadd":
		os._internals.ps.copyProcessTableEntryToPCB('groupadd', null, command);
		break;
	    case "groupdel":
		os._internals.ps.copyProcessTableEntryToPCB('groupdel', null, command);
		break;
	    case "chmod":
		os._internals.ps.copyProcessTableEntryToPCB('chmod', null, [command[1], command[2]]);
            break;
        }
    }

    function pathAbsolute(path) {
        var splitPath = path.split("/");
        if(splitPath[0] === 'root'){
            return true;
        } else {
            return false;
        }
    }
    
    function validPath(path) {
        if (path === '..' && pwd.currentDirectory != os._internals.fs.disk.root){
            return true;
        }

        var node = os._internals.fs.disk.root;
        console.log(node);
        path = convertToAbsolute(path);
        var splitPath = path.split('/');
        splitPath.shift();

        for (var i = 0 ; i < splitPath.length; i++){
            node = node[splitPath[i]];

            if(!node){
                return false;
            }
        }
        return true;
    }

    function convertToAbsolute(path) {
        if (!pathAbsolute(path)) {
            if (pwd.string.charAt(pwd.string.length - 1) != '/') {
                path = pwd.string + '/' + path;
            } else {
                path = pwd.string + path;
            }
        }
        return path;
    }

    function changeDirectory(path){
        var splitPath;

        if(validPath(path)) {
            var temp;
            if (path === '..') {
                temp = pwd.string.split('/');
                temp.pop();
                path = temp.join('/');
                

                pwd.string = path;
                pwd.currentDirectory = os._internals.fs.disk.root;
                splitPath = path.split('/');
                splitPath.shift();

                for (var i = 0; i < splitPath.length; i++) {
                    console.log(pwd.currentDirectory);
                    pwd.currentDirectory = currentDirectory[splitPath[i]];

                }
            } else {
                path = convertToAbsolute(path);
                pwd.string = path;
                pwd.currentDirectory = os._internals.fs.disk.root;
                splitPath = path.split('/');
                splitPath.shift();

                for (var i = 0; i < splitPath.length; i++) {
                    console.log(splitPath[i]);
                    console.log('Current Directory In Change Directory Loop: ');
                    console.log(pwd.currentDirectory);
                    

                    temp = pwd.currentDirectory[splitPath[i]];
                   
                    pwd.currentDirectory = temp;
                }
            }
        } else {
            stdout.appendToBuffer("Invalid Path");
        }
    }

function checkPermissions(path, opType) {
    var absolutePath = convertToAbsolute(path);
    var splitPath = absolutePath.split('/');
    var node = os._internals.fs.disk.root;

    var permPos;	// Holds position for r, w, or x (rwx)
    if (opType == 'r')
        permPos = 0;
    else if(opType == 'w')
        permPos = 1;

    splitPath.shift();

    for (var i = 0 ; i < splitPath.length; i++) {
        node = node[splitPath[i]];

        if (!node) {
            return false;
        }
    }


    if (opType === 'r')
        permPos = 0;
    else if (opType === 'w')
        permPos = 1;

    // Check if it is the file's owner
    if (node.acl.owner.user === os._internals.sec.user) {
        if (node.acl.owner.permissions.substr(permPos, 1) == opType) {
            console.log("File permission granted");
            return true;
        }
    }

    // Otherwise check the group
    var userFound = false;
    var data = os._internals.fs.disk.root.etc.shadow['Groups.csv'].data;

    var x = data.split('\n');
    console.log("x: " + x);
    for (var i = 0; i < x.length ; i++) {
        var y = x[i].split(',');
        if( y[0] === node.acl.group.name){
            for (var i = 1; i < y.length;i++) {
                if (y[i]===os._internals.sec.user) {
                    userFound = true;
                    break;
                }
            }
        }
    }
    if (userFound) {
        if (node.acl.group.permissions.substr(permPos, 1) === opType) {
            console.log("File permission granted");
            return true;
        }
    }

    // Otherwise check if universal access is granted
    /*
    if (node.acl.others.permissions.substr(permPos, 1) == opType) {
        console.log("File permission granted");
        return true;
    }
*/
    console.log("File permission denied");
    return false;
}

})();
