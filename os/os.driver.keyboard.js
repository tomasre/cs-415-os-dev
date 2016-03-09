/**
 * Created by euphoric on 3/8/16.
 */
"use strict";

(function(){

    os._internals.drivers.keyboard = {
        keyboardInputFunction : keyboardInputFunction
    };

    function keyboardInputFunction(){
        document.addEventListener("keydown", keyInput(event),true);
    }

    function keyInput(event) {
        var keyCode = event.keyCode;
        var line = "";
        if (printableKey(keyCode)) {
            var char = String.fromCharCode(keyCode);
            document.getElementById("cL").innerHTML =
                document.getElementById('cL').innerHTML + char;
        } else if (keyCode ===8){
           document.getElementById("cL").innerHTML = document.getElementById("cL").innerHTML.slice(0,-1);


        } else if (keyCode === 13){
            line = document.getElementById("cL").innerHTML;
            line.appendToBuffer();
           // line also passed to CLI process
        } else {

        }
    }

    function printableKey(keycode){

        if ((keycode > 47 && keycode < 58) ||
                keycode === 13 || (keycode > 64 && keycode <91) ||
            (keycode > 185 && keycode <193))
        {
            return true;
        } else {
            return false;
        }


    }





})();