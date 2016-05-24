(function() {
  var userMan = "[sourceFile] [destination file]";

  os.bin.BankBookCalculator = BankBookCalculator;
  os.ps.register('BankBookCalculator', BankBookCalculator, {stdout: true, pipeIn: false, pipeOut: false},userMan);
  
  function BankBookCalculator(options, argv) {
    var stdout = options.stdout;
	var pipeIn = false;
	var pipeOut = false;

	if(options.pipeIn == true)
		pipeIn = true;

	if(options.pipeOut == true)
		pipeOut = true;
	
	var sourceFile = argv[0];
	if(argv[1] != undefined)
		var destinationFile = argv[1];

    async.waterfall([

      // First we are going to get the length since that does not require the file to be open

      function (callback) {
		  if(pipeIn == true) {
			  callback(null, sourceFile.length);
		  } else {			  
				os.fs.length(sourceFile, function (errorLength, length) {
				//if -1 is "returned" an error has occurred
				//the proper error UNIX/C error message will be printed
				if (errorLength === -1) {
					console.log('File data: error getting file length:');
					//console.log(os.errno.errorCode);
					console.log('\n');
					// NOTE there was an error so we pass an error to the callback
					callback('Error');
				} else {
					//console.log('VM: length success---------');
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
				os.fs.open(sourceFile, function (errorOpen, fh) {
					if (errorOpen === -1) {
						console.log(sourceFile, ': error opening file:');
						console.log(errorOpen);
						console.log('\n');
						// AN ERROR OCCURRED BREAK THE WATERFALL 'CHAIN'
						callback(errorOpen);
					} else {
						var openMsg = "Opening " + fh.name + " size: " + length;
						// NOTE: this is passing the length and fh to the next waterfall function
						//console.log('VM: open success---------');
						stdout.appendToBuffer(openMsg);
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
				var CHARS_TO_READ = 100;

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
					var charCount = currentPosition + CHARS_TO_READ > length ? length - currentPosition : CHARS_TO_READ;

					os.fs.read(fh, charCount, function (errorRead, data) {
						if (errorRead===-1) {
							// ERROR on the read not continuing
							console.log(sourceFile, ': error reading file:');
							//console.log(errorCode);
							console.log('\n');

							// note calling waterfall function to exit this whole read 'asynchronous loop'
							waterfallCallback('Error Read');

						} else {
							// read was successful
							// append the data we got
							fullFile += data;
							//console.log('VM: read success---------');

							// now we seek forward what we just read
							os.fs.seek(fh, charCount, function (errorSeek) {
								if (errorSeek===-1) {
									// ERROR on the seek not continuing
									console.log(sourceFile, ': error seeking file:');
									//console.log(errorCode);
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

      function (length, fh, fullData, callback) {
        var loadSym = "...";
		var calculatingMsg = "Calculating balance...";

        stdout.appendToBuffer(calculatingMsg);
        stdout.appendToBuffer(loadSym);

        var destinationFile;
		var error = "";
        var result = calculateBalance(fullData);
		if(result != 'error') {
			// Round the value
			var tempResult = result.toString();
			var decimal;
			
			// Round the value
			var decimalPlace = tempResult.split(".");
			
			if(decimalPlace[1].length > 2)
			{
				if(Number(decimalPlace[1].substr(2,1)) >= 5) {
					decimal = Number(decimalPlace[1].substr(0,2));
					decimal++;
				}
				else
					decimal = Number(decimalPlace[1].substr(0,2));
			}
			result = decimalPlace[0].toString() + "." + decimal.toString();
		
			var defaultDestination = "totalBalance.csv";

			console.log("Total balance calculated: " + result);
			stdout.appendToBuffer("Total balance calculated: " + result);

			// checks if location is specified if not creates a default named file
			if( argv.length === 2){
				destinationFile = argv[1];
			} else {
				destinationFile = defaultDestination;
			}
			if(!pipeOut)
				stdout.appendToBuffer("Exporting total balance to " + destinationFile);
		} else {
			error = 'error';
		}

        async.waterfall([

          function (callback) {
			  if(error == 'error') {
				  if(pipeIn == true) {
						stdout.appendToBuffer("Unable to calculate values piped in;");
						stdout.appendToBuffer("check file to make sure it is correct numeric format");
				  } else {
						stdout.appendToBuffer("Unable to calculate values in file " + sourceFile + ";");
						stdout.appendToBuffer("check file to make sure it is correct numeric format");
				  }
					
					callback('Error');
			  } else {
				  if(pipeOut == true) {
					  callback(null, result);
				  } else {
						os.fs.create(destinationFile, function (errCreate, newFile) {

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
			var fullResult = result;
            var buffer='';
            var CHARS_TO_WRITE = 5;
            var writeSize=result.length;
            var fileName = "";
            var writePosition = 0;

			if(pipeOut == true) {
				  os._internals.ps.processTable['BankBookCalculator'].options.pipeOut = false;
				  console.log("Piping result as input...");
				  os._internals.ps.pipeInputToBuffer(result);
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
					buffer = fullResult.substr(writePosition,CHARS_TO_WRITE);

					os.fs.write(writeTarget, buffer, writePosition, function (error, fileName) {

						if (error === -1) {
							console.log(writeTarget, ': error writing');
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
				  os._internals.ps.processTable['BankBookCalculator'].options.pipeIn = false;
			  } else {
					os.fs.close(sourceFile,function(errClose,msg){

						if(errClose === -1){
							console.log(msg);
						} else {
							console.log(msg);
							callback(null);
						}
					});
			  }
			  
			  // Reset the pipeOut if necessary
			  if(pipeOut == true)
				  os._internals.ps.processTable['BankBookCalculator'].options.pipeOut = false;
          }], function (err, writeResult) {
				// Reset the pipes if necessary
				if(pipeIn == true)
				  os._internals.ps.processTable['BankBookCalculator'].options.pipeIn = false;
			  
				if(pipeOut == true) 
				  os._internals.ps.processTable['BankBookCalculator'].options.pipeOut = false;

                if(err===-1){
                  console.log('Write Async Block failure');

                } else {
                  console.log('Write Async Block Success');
                }
        });
      }], function (error, result) {
      if (error===-1) {
        console.log('ERROR in execution. exited early');
      } else {
        stdout.appendToBuffer("Finished");
        console.log('Bank Book Calculator Done');
      }
    });
  }


  //finds the contact in the "file"
  function calculateBalance(csvString) {
    var lines = csvString.split('\n');
    var totalBalance = 0;

    for (row in lines) {
		if (lines[row] == "")
			continue;

      var balance = lines[row].split(",");

	if(balance[1] == undefined)
		return 'error';

	  // Check if balance is able to be calculated; 
	  if(balance[1].substr(0, 1) !== '+') {
		  if(isNaN(parseFloat(balance[1])) || !isFinite(balance[1])) {
			  console.log("Unable to calculate; closing BankBookCalculator");
			  return 'error';
		  }
	  }
	  else {
		  if(isNaN(parseFloat(balance[1].substr(1, balance[1].length - 1))) 
			  || !isFinite(balance[1].substr(1, balance[1].length - 1))) {
			  console.log("Unable to calculate; closing BankBookCalculator");
			  return 'error';
		  }
	  }
      if(balance[1].substr(0, 1) !== '+')
		  totalBalance -= Number(balance[1]);
	  else
		  totalBalance += Number(balance[1].substr(1, balance[1].length - 1));
    }
	  return totalBalance;
  }
})();
