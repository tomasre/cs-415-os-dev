'use strict';
(function () {
    os.fs.read(function (err, data) {
        console.log('data from read:');
        console.log(data);
    });
})();