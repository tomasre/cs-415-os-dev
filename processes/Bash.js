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

            case "cat":
                os._internals.ps.copyProcessTableEntryToPCB('concatenate', null, [command[1]]);
                //stdout.appendToBuffer(response);
                break;

            case "exe":
                if(os._internals.ps.processTable[command[1]]){
                    var args = command.slice(2,command.length);
                    os._internals.ps.copyProcessTableEntryToPCB(command[1],null,args);
                } else {
                    stdout.appendToBuffer("invalid command");
                }
                break;
            case "more":
                os._internals.ps.copyProcessTableEntryToPCB('more', null, command[1]);
                break;
            case "clear":
                document.getElementById('textArea').innerHTML = "";
        }
    }



})();
