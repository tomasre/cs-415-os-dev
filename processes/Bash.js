'use strict';

(function () {
    var pwd = {
        currentDirectory: os._internals.fs.disk.root,
        string: "root/"
    };

    console.log(pwd.currentDirectory);

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
                var response = Object.getOwnPropertyNames(pwd.currentDirectory).join("<br>");
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

            // for now hardcoded
            case "drivertest":
                os._internals.ps.copyProcessTableEntryToPCB('DeviceDriverTest');
                //os.ps.register('vectorcalculator', os.bin.vectorcalculator);
                stdout.appendToBuffer('Running ddrivertest.js');
                break;

            case "threadtest":
                os._internals.ps.copyProcessTableEntryToPCB('ThreadTest', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running threadtest.js');
                break;

            case "mutextest":
                os._internals.ps.copyProcessTableEntryToPCB('MutexTest', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running mutextest.js');
                break;

            case "semaphoretest":
                os._internals.ps.copyProcessTableEntryToPCB('SemaphoreTest', null, ['argument', 'argument2']);
                stdout.appendToBuffer('Running semaphoretest.js');
                break;

            case "cat":
                os._internals.ps.copyProcessTableEntryToPCB('concatenate', null, [command[1]]);
                //stdout.appendToBuffer(response);
                break;

            case "exec":
                if(os._internals.ps.processTable[command[1]]){
                    var args = command.slice(2,command.length);
                    os._internals.ps.copyProcessTableEntryToPCB(command[1],null,args);
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
                stdout.appendToBuffer(ps);
                break;

            case "more":
                os._internals.ps.copyProcessTableEntryToPCB('more', null, command[1]);
                break;
            case "clear":
                document.getElementById('textArea').innerHTML = "";
                break;
            case "help":
                var cliCommands = Object.getOwnPropertyNames(os._internals.ps.processTable);
                stdout.appendToBuffer("Available Programs-----");
                for(var x in cliCommands){
                    stdout.appendToBuffer(cliCommands[x]);
                }
                stdout.appendToBuffer("To Run a User Process Type");
                stdout.appendToBuffer("exe (process) (args) ");
                stdout.appendToBuffer("for more info type man (process)");
                break;

            // manual now implemented
            case "man":
                if(os._internals.ps.processTable[command[1]]){
                    stdout.appendToBuffer(os._internals.ps.processTable[command[1]].man);
                }
                break;

            case "cd":
                changeDirectory(command[1]);
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

    function convertToAbsolute(path){
        if(!pathAbsolute(path)){
            path = pwd.string + path;
        }
        return path
    }

    function changeDirectory(path){
        var splitPath;

        if(validPath(path)) {
            if (path === '..') {
                var temp = pwd.string.split('/');
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
                    
                    var temp;
                    temp = pwd.currentDirectory[splitPath[i]];
                   
                    pwd.currentDirectory = temp;
                }
            }
        } else {
            stdout.appendToBuffer("Invalid Path");
        }
    }





})();
