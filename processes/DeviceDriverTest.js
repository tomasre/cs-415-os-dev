'use strict';

(function () {
    os.ps.register('DeviceDriverTest', main, {stdout: true});

    function main(options, argv) {

        var stdout = options.stdout;
        stdout.appendToBuffer('Wow its bed time\n');

        stdout.appendToBuffer('Hey its really bed time now\n');

        stdout.appendToBuffer('Okay im done now\n');

        console.log(argv);

    }
})();
