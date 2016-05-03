'use strict';

(function () {
    os.ps.register('DeviceDriverTest', main, {stdout: true, stdin: inputListener});

    var stdout;

    function main(options, argv) {

        stdout = options.stdout;
        stdout.appendToBuffer('Wow its bed time\n');

        stdout.appendToBuffer('Hey its really bed time now\n');

        stdout.appendToBuffer('Okay im done now\n');

        console.log(argv);

    }

    function inputListener(stream) {
        var buf = stream.consumeBuffer();

        stdout.appendToBuffer(buf);

        console.log('driver:');

        // NOTE: ALL INPUTS HAVE dummy@OS... attached
        if (buf === 'dummy@OS $ exit') {
            // WILL STOP LISTENING FOR EVENTS NOW
            console.log('deregistering');
            os._internals.drivers.keyboard.deregisterStream();
        }
    }
})();
