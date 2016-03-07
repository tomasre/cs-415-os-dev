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
        console.log('DISPLAY DRIVER PRINTING:');
        console.log(buffer);
        console.log('\n');
    }
})();