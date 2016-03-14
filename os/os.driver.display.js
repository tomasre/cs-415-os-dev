'use strict';

(function () {

    os._internals.drivers.display = {
        streamUpdateFunction : streamUpdateFunction
    };

    function streamUpdateFunction(writeableStream) {
        updateDisplay(writeableStream.consumeBuffer());
    }

    /*
    buffer is a string
    updateDisplay will print it to the 'display device' along with a newline
     */
    function updateDisplay(buffer) {
        /*
        will print to the "terminal" webpage portion
        right now just printing to console
         */

        var terminalTextField = document.getElementById('textArea');
        console.log('DISPLAY DRIVER PRINTING:');
        terminalTextField.innerHTML = terminalTextField.innerHTML +buffer + "<br>";
        console.log('\n');
    }
})();