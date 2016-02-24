'use strict';
(function () {

    os.ps.register('dummy', main);

    function main() {
        os.fs.open('Stats_Data.csv', function (errorOpen, fh) {
            console.log('fs open CB');
            if (errorOpen) {
                // ERROR OPENING FILE, as a process I HAVE TO HANDLE THIS here!!!!!!!!
                console.log(errorOpen);
            } else {

                // I NOW HAVE ACCESS TO filehandle as object fh


                os.fs.read(fh, 5, function (errorRead, data) {
                    if (errorRead) {
                        // ERROR READING FILE, as a process I HAVE TO HANDLE THIS here!!!!!!!!
                        console.log(errorRead);
                    } else {

                        // I know have the data
                        console.log(data);
                    }
                })
            }
        });

        // I DO NOT HAVE ACCESS TO THE FILE HERE!!!!!!!!!!!!!!!!!!!!!

    }
    
})();