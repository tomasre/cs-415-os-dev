(function() {
// NEW Register process now contains a Manual Property that takes a string which will be displayed
  // when the user types man process name
  var userMan = " [search Key] [sourceFile] (optional) [destination file]";

  os.bin.ContactManager = ContactManager;
  os.ps.register('ContactManager', ContactManager, {stdout: true, pipeIn: false, pipeOut: false},userMan);

  function ContactManager(options, argv) {
    var stdout = options.stdout;
	var pipeIn = false;
	var pipeOut = false;

	if(options.pipeIn == true)
		pipeIn = true;

	if(options.pipeOut == true)
		pipeOut = true;
	
    var openTarget = argv[1];
    var searchKey = argv[0];

    async.waterfall([

		// First we are going to get the length since that does not require the file to be open

		function (callback) {
			if(pipeIn == true) {
				callback(null, openTarget.length);
			} else {
				os.fs.length(openTarget, function (errorLength, length) {
					//if -1 is "returned" an error has occurred
					//the proper error UNIX/C error message will be printed
					if (errorLength === -1) {
						console.log('contact data: error getting file length:');
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
			os.fs.open(openTarget, function (errorOpen, fh) {
				if (errorOpen === -1) {
					console.log('Contact_Data.csv: error opening file:');
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
						console.log('Contact_Data.csv: error reading file:');
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
								console.log('Contact_Data.csv: error seeking file:');
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
        var searchMsg = "Searching Contacts ...";

        stdout.appendToBuffer(searchMsg);
        stdout.appendToBuffer(loadSym);

        var destinationFile;
        var result = search(fullData, searchKey);
        var defaultDestination = "newContact.csv";

        console.log("Contact Found: " + result);
        stdout.appendToBuffer("Contact Found: " + result);

        // checks if location is specified if not creates a default named file
        if( argv.length === 3){
          destinationFile = argv[2];
        } else {
          destinationFile = defaultDestination;
        }

		if(!pipeOut)
			stdout.appendToBuffer("Exporting Contact to " + destinationFile);

        async.waterfall([
          function (callback) {
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
          },

          function (writeTarget, recursivecallback) {
            var fullResult= result;
            var buffer='';
            var CHARS_TO_WRITE = 5;
            var writeSize=result.length;
            var fileName = "";
            var writePosition = 0;

			if(pipeOut == true) {
				  os._internals.ps.processTable['ContactManager'].options.pipeOut = false;
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
					buffer = fullResult.substring(writePosition,CHARS_TO_WRITE);

					os.fs.write(writeTarget, buffer, function (error, fileName) {

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
				os._internals.ps.processTable['ContactManager'].options.pipeIn = false;
			} else {
				os.fs.close(openTarget,function(errClose,msg){

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
				os._internals.ps.processTable['ContactManager'].options.pipeOut = false;
          }], function (err, writeResult) {		  
				// Reset the pipes if necessary
				if(pipeIn == true)
				  os._internals.ps.processTable['ContactManager'].options.pipeIn = false;
			  
				if(pipeOut == true) 
				  os._internals.ps.processTable['ContactManager'].options.pipeOut = false;

                if(err===-1){
                  console.log('Write Async Block failure');

                } else {
                  console.log('Write Async Block Success');
                }
        });
      }], function (error, result) {
      if (error===-1) {
        console.log('Contact_Data: ERROR in execution. exited early');
      } else {
        stdout.appendToBuffer("Finished");
        console.log('Contact Manager Done');
      }
    });
  }


  //finds the contact in the "file"
  function search(csvString, key) {

    var substr = csvString.split('\n');
    var foundContact = "-1";

    for (row in substr) {
      var contact =substr[row].split(",");
      if (contact[0]===key){
        foundContact = contact.join(',');
      }
    }
      if(foundContact === "-1"){
        foundContact = "Contact Not Found";
      }
      return foundContact;
    }

})();
