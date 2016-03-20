'use strict';

(function () {
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

    function main(out, stdin) {
        stdout = out;
        console.log('BASH starting');
    }

    function streamListener (stream) {
        console.log('BASH consuming buffer');
        var buf = stream.consumeBuffer();
        stdout.appendToBuffer(buf)
        console.log(buf);
    }

})();
