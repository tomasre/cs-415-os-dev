/**
 * Created by euphoric on 3/14/16.
 */
'use strict';
(function(){

function main (stdin, stdout){
    var command = stdin.split(' ');
    var streamRef = stdout;






}

    function clear(streamRef){

        streamRef.wipeBuffer();

        // dont know how to use buffer to clear the screen completely because we are appending html so for now
        document.getElementById("textArea").innerHTML= "";

        document.getElementById("commandLine").value = "";
    }

    function ls(){

    }



    function exectuable(){

    }














})();