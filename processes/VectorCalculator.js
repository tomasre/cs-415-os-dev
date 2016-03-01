'use strict';

/*
this will be using the async.waterfall library to manage callbacks
 */
(function () {

    os.ps.register('vectorCalculator', main);

    function main() {

        // start doing some fs operations
        async.waterfall([

            /*
            First we are going to get the length since that does not require the file to be open
             */
            function (callback) {
                os.fs.length('vector_data.csv', function (errorLength, length) {
                    if (errorLength) {
                        console.log('vector_data.csv: error getting file length:');
                        console.log(errorLength);
                        console.log('\n');
                        // NOTE there was an error so we pass an error to the callback
                        callback(errorLength);

                    } else {
                        // NOTE we are passing no error, then the length to the next item in the waterfall
                        callback(null, length);
                    }
                });
            },
            /*
            This is the open function
            notice how its wrapped in another function the outside function is kind of
            like the required 'waterfall function'
             */
            function (length, callback) {
                os.fs.open('vector_data.csv', function (errorOpen, fh) {
                    if (errorOpen) {
                        console.log('vector_data.csv: error opening file:');
                        console.log(errorOpen);
                        console.log('\n');
                        // AN ERROR OCCURRED BREAK THE WATERFALL 'CHAIN'
                        callback(errorOpen);

                    } else {
                        // NOTE: this is passing the length and fh to the next waterfall function
                        callback(null, length, fh);
                    }
                });
            },
            /*
            THIS is the next function note how we have access to the fh
            Note for this example I will be reading a few characters max to illustrate reading the whole file
            If you were doing this for your example you would probably want to read the max
            note how waterfallCallback is not immediatelly called because we have to read and seek and read and seek
            until we reach the end of the file
             */
            function (length, fh, waterfallCallback) {
                // we want to read and seek until position === length
                // our position is currently at 0

                // THIS IS SMALL TO SHOW MULTIPLE READS
                var CHARS_TO_READ = 2;

                // THIS IS TO KEEP TRACK OF WHERE WE ARE IN THE FILE
                var currentPosition = 0;

                // THIS IS WHERE THE FILE DATA IS STORED
                var fullFile = '';

                /*
                after every read and seek checkCompleted checks to see if its done
                note this has ZERO asynchronous operations
                 */
                function checkCompleted() {
                    if (currentPosition >= length) {
                        // WE ARE DONE READING THE WHOLE FILE,
                        // we can move on with th
                    }
                }


                /*
                reads the next block of data, then seeks forward that amount, then calls check completed to
                see if it needs to read more before finishing
                NOTE: this function has two asynchronous fs operations
                 */
                function readNextBlock() {
                    // if there is one character left in the file, dont read 100
                    var charCount = currentPosition + CHARS_TO_READ > length ? length - currentPosition: CHARS_TO_READ;

                    os.fs.read(fh, charCount, function (errorRead, data) {
                        if (errorRead) {
                            // ERROR on the read not continuing
                            console.log('vector_data.csv: error reading file:');
                            console.log(errorRead);
                            console.log('\n');

                            // note calling waterfall function to exit this whole read 'asynchronous loop'
                            waterfallCallback(errorRead);

                        } else {
                            // read was successful
                            // append the data we got
                            fullFile += data;

                            // now we seek forward what we just read
                            os.fs.seek(fh, charCount, function (errorSeek) {
                                if (errorSeek) {
                                    // ERROR on the seek not continuing
                                    console.log('vector_data.csv: error seeking file:');
                                    console.log(errorSeek);
                                    console.log('\n');

                                    // note calling waterfall function to exit this whole seek 'asynchronous loop'
                                    waterfallCallback(errorSeek);

                                } else {
                                    // we successfully seeked forward
                                    // we can now check if we are finished
                                    checkCompleted();
                                }
                            });
                        }
                    });
                }
            }
            /*
            this is the ending function that gets called after the waterfall is complete
             */
        ], function (error, result) {

        });














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


    }

})();