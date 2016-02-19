'use strict';
(function () {
    os.fs.read = readFile;

    function readFile (cb) {
        console.log('READ');
        cb(null, 'fuck');
    }
})();