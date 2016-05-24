'use strict';

/*
this will be using the async.waterfall library to manage callbacks
 */
(function () {

    os.ps.register('vectorcalculator', main, {stdout: true, pipeIn: false, pipeOut: false});

    function main(options, argv) {
        /*
        stdin is accessed via options.stdin
        stdout is accessed via options.stdout
        argv is the cli arguments passed into it
        */
		var stdout = options.stdout;
		var pipeIn = false;
		var pipeOut = false;

		if(options.pipeIn == true)
			pipeIn = true;

		if(options.pipeOut == true)
			pipeOut = true;
		
		var sourceFile;
		if(pipeIn == true)
			sourceFile = argv[0];
		else
			sourceFile = 'vector_data.csv';

        // start doing some fs operations
        async.waterfall([

            /*
            First we are going to get the length since that does not require the file to be open
             */
            function (callback) {
				if(pipeIn == true) {
					callback(null, sourceFile.length);
				} else {			
					os.fs.length(sourceFile, function (errorLength, length) {
						if (errorLength===-1) {
							console.log('vector_data.csv: error getting file length:');
							//console.log(errorCode);
							console.log('\n');
							// NOTE there was an error so we pass an error to the callback
							callback('Error Length');

						} else {
							console.log('VM: length success---------');
							// NOTE we are passing no error, then the length to the next item in the waterfall
							callback(null, length);
						}
					});
				}
            },

            /*
            This is the open function
            notice how its wrapped in another function the outside function is kind of
            like the required 'waterfall function'
             */
            function (length, callback) {
				if(pipeIn == true) {
					callback(null, length, null);
				} else {
					os.fs.open('vector_data.csv', function (errorOpen, fh) {
						if (errorOpen===-1) {
							console.log('vector_data.csv: error opening file:');
							//console.log(errorOpen);
							console.log('\n');
							// AN ERROR OCCURRED BREAK THE WATERFALL 'CHAIN'
							callback('Error Open');

						} else {
							// NOTE: this is passing the length and fh to the next waterfall function
							console.log('VM: open success---------');
							callback(null, length, fh);
						}
					});
				}
            },

            /*
            THIS is the next function note how we have access to the fh
            Note for this example I will be reading a few characters max to illustrate reading the whole file
            If you were doing this for your example you would probably want to read the max
            note how waterfallCallback is not immediatelly called because we have to read and seek and read and seek
            until we reach the end of the file
             */
            function (length, fh, waterfallCallback) {
				if(pipeIn == true) {
					waterfallCallback(null, length, fh, sourceFile);
				} else {
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
							// we can move on with the waterfall
							// note we are passing all the data we have got so far to the next waterfall function
							waterfallCallback(null, length, fh, fullFile);

						} else {
							// we need to read another block at least
							readNextBlock();
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
							if (errorRead===-1) {
								// ERROR on the read not continuing
								//console.log('vector_data.csv: error reading file:');
								//console.log(errorRead);
								//console.log('\n');

								// note calling waterfall function to exit this whole read 'asynchronous loop'
								waterfallCallback(errorRead);

							} else {
								// read was successful
								// append the data we got
								fullFile += data;
								//console.log('VM: read success---------');

								// now we seek forward what we just read
								os.fs.seek(fh, charCount, function (errorSeek) {
									if (errorSeek===-1) {
										// ERROR on the seek not continuing
										console.log('vector_data.csv: error seeking file:');
										// console.log(errorSeek);
										console.log('\n');

										// note calling waterfall function to exit this whole seek 'asynchronous loop'
										waterfallCallback('Error Seek');

									} else {
										currentPosition += charCount;
										//console.log('VM: seek success---------');
										// we successfully seeked forward
										// we can now check if we are finished
										checkCompleted();
									}
								});
							}
						});
					}

					// NOTE!!!!!!!
					// We have to call checkCompleted (or technically readNextBlock once to start the chain
					checkCompleted();
				}
            },

            /*
            WE HAVE ALL OUR DATA WE CAN DO OUR PROCESSING
            Note writing to output file
            This is only one vector so the length will be less than 100 CHAR (fs buffer size)
            So I am doing it in one operation, if you are writing a giant file it will happen in multiple
             */
            function (length, fh, fullFile, callback) {
				var error = "";
				
                var outFile = performVectorOperations(fullFile);
				
				if (outFile == 'error')
					error = 'error';


                async.waterfall([
					function (callback) {
						if(error == 'error') {
							if(pipeIn == true) {
								stdout.appendToBuffer("Unable to calculate values piped in;");
								stdout.appendToBuffer("check file to make sure it is correct format");
							} else {
								stdout.appendToBuffer("Unable to calculate values in file " + sourceFile + ";");
								stdout.appendToBuffer("check file to make sure it is correct format");
							}
					
							callback('Error');
						} else {
							if(pipeOut == true) {
								callback(null, outFile);
							} else {
								os.fs.create('vector_calc_out.csv', function (errCreate, newFile) {

									if (errCreate === -1) {
										console.log("error on create");
										callback('Error');

									} else {
										console.log('Sucess--------- new file created:' + newFile);
										console.log(os._internals.fs.disk);
										callback(null, newFile);
									}
								});
							}
						}
                    },

                    function (writeTarget, recursivecallback) {
                        var fullResult= outFile;
                        var buffer='';
                        var CHARS_TO_WRITE = 50;
                        var writeSize= outFile.length;
                        var fileName = "";
                        var writePosition = 0;

						if(pipeOut == true) {
							os._internals.ps.processTable['vectorcalculator'].options.pipeOut = false;
							console.log("Piping result as input...");
							os._internals.ps.pipeInputToBuffer(outFile);
							recursivecallback(null, writeTarget, fileName);
						} else {
						
							function writeCompleted() {
								if (writePosition >= writeSize) {
									recursivecallback(null, writeTarget, fileName);

								} else {
									// we need to read another block at least
									writeNextBlock();
								}
							}

							function writeNextBlock() {
								buffer = fullResult.substring(writePosition,CHARS_TO_WRITE);

								os.fs.write(writeTarget, buffer, writePosition, function (error, fileName) {

									if (error === -1) {
										console.log('Contact_Data.csv: error writing');
										console.log(error);
										console.log('\n');
										callback('Error');

									} else {
										console.log("Write at Postion: " + writePosition);
										writePosition = writePosition + CHARS_TO_WRITE;
										writeCompleted();
									}
								});
							}
							writeCompleted();
						}
                    },

                    function(writeTarget,fileName,callback){
						// Reset the pipeIn if necessary
						if(pipeIn == true) {
							os._internals.ps.processTable['vectorcalculator'].options.pipeIn = false;
						} else {
							os.fs.close('vector_data.csv',function(errClose,msg){

								if(errClose === -1){
									console.log(msg);
								} else {
									console.log(msg);
									callback(null)
								}
						

							});
						}
						// Reset the pipeOut if necessary
						if(pipeOut == true)
							os._internals.ps.processTable['vectorcalculator'].options.pipeOut = false;
                    }], function (err, writeResult) {

                    if(err===-1){
                        console.log('Write Async Block failure');

                    } else {
                        //console.log('Write Async Block Success');
                    }
                });
            }], function (error, result) {
				// Reset the pipes if necessary
				if(pipeIn == true)
				  os._internals.ps.processTable['vectorcalculator'].options.pipeIn = false;
			  
				if(pipeOut == true) 
				  os._internals.ps.processTable['vectorcalculator'].options.pipeOut = false;
            if (error===-1) {
                console.log('Contact_Data: ERROR in execution. exited early');
            } else {
                //console.log('Contact Manager Done');
            }
        });
    }

    // do the actual vector sync calculations
    function performVectorOperations(fullData) {
        /*
         my file looks like:
         data: '1,2\n' +
         '2,3\n' +
         '1,3',
         */

        // parse the data
        var vectors = fullData.split('\n');
        for (var i = 0; i < vectors.length; i++) {
            vectors[i] = vectors[i].split(',');
			if(vectors[i][1] == undefined)
				return 'error';
            for (var j = 0; j < vectors[i].length; j++) {
                vectors[i][j] = parseInt(vectors[i][j]);
            }

        }

        var out = [];
        // initialize sums
        for (var i = 0; i < vectors[0].length; i++) {
            out[i] = 0;
        }

        // sum it up
        for (var i = 0; i < vectors.length; i++) {
            for (var j = 0; j < vectors[i].length; j++) {
                out[j] += vectors[i][j];
            }
        }

        return out.join(',');
    }
})();
