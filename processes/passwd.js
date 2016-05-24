(function() {
// NEW Register process now contains a Manual Property that takes a string which will be displayed
  // when the user types man process name
  var userMan = " [search Key]; if found, will prompt to update password after inputting password";
  
  var stdout;
  var pipeIn;
  var newPassword;
  var lines;
  var result;
  var newFileData;
  var openTarget;

  os.bin.passwd = passwd;
  os.ps.register('passwd', passwd, {stdin: passwdListener, stdout: true, pipeIn: false},userMan);

  function passwd(options, argv) {
	stdout = options.stdout;
	pipeIn = false;

	if(options.pipeIn == true)
		pipeIn = true;
	
	var searchKey = argv;
	
	openTarget = 'root/etc/shadow/User_Password.csv';

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
						console.log('User_Password.csv: error getting file length:');
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
					console.log('User_Password.csv: error opening file:');
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
						console.log('User_Password.csv: error reading file:');
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
								console.log('User_Password.csv: error seeking file:');
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
        var searchMsg = "Searching Users ...";
		lines = fullData.split("\n");

        stdout.appendToBuffer(searchMsg);
        stdout.appendToBuffer(loadSym);

        result = search(lines, searchKey);

		if(result.user == "User Not Found") {
			stdout.appendToBuffer("User Not Found");
			callback(-1);
			return;
		}
		else {
			stdout.appendToBuffer("User Found");	
			console.log("User Found: ");
			stdout.appendToBuffer("Enter new password: ");
			
			callback(null, length, fh, fullData, lines, result);
		}
	  },
		
	  ], function (error, result) {
      if (error===-1)
        console.log('passwd: ERROR in execution. exited early');
    });
  }
/*

  */
  
  
  //finds the user in the "file"
  function search(substr, key) {

    var foundUser = "-1";
	var rownum = 0;
	var userAndRow = {user:'', rownum: ''};

    for (row in substr) {
      var users =substr[row].split(",");
      if (users[0]===key){
        foundUser = users.join(',');
		break;
      }
	  else
		  rownum++;		  
    }
      if(foundUser === "-1"){
        foundUser = "User Not Found";
      }
	  
	  userAndRow.user = foundUser;
	  userAndRow.rownum = rownum;
      return userAndRow;
    }

	function passwdListener(stream) {
        var buf = stream.consumeBuffer();
		
		// Get the new password typed in
		var input = buf.substr(11, buf.length - 11);
		
		// Get rid of leading blanks
		var i = 0;
		while(i < input.length && input[i] == ' ')
			i++;
		// Now get the password
        newPassword = input.substr(i, input.length - i);
		
		stdout.appendToBuffer("Updating user password...");
		
		// Splice the password back into fullData, and write to file
		var users = lines[result.rownum].split(",");
		lines[result.rownum] = users[0] + ',' + newPassword;
		newFileData = lines.join("\n");
		
		os._internals.drivers.keyboard.deregisterStream();
		
		async.waterfall([
			function (callback) {				
				var fullResult= newFileData;
				var buffer='';
				var CHARS_TO_WRITE = 5;
				var writeSize=newFileData.length;		// Dummy variable so it doesn't write, waits for password input
				var fileName = "";
				var writePosition = 0;

				function writeCompleted() {
					if (writePosition >= writeSize) {
						callback(null, fullResult);

					} else {
						// we need to read another block at least
						writeNextBlock();
					}
				}
	
				function writeNextBlock() {
					buffer = newFileData.substr(writePosition,CHARS_TO_WRITE);
			
					os.fs.write(openTarget, buffer, writePosition, function (error, fileName) {				
						if (error === -1) {
							console.log('User_Password.csv: error writing');
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
			},

			function (fullResult, recursivecallback) {
				// Reset the pipeIn if necessary
				if(pipeIn == true) {
					os._internals.ps.processTable['passwd'].options.pipeIn = false;
				} else {
					os.fs.close(openTarget,function(errClose,msg){
						if(errClose === -1){
							console.log(msg);
						} else {
							console.log(msg);
							recursivecallback(null);
						}
					});
				}
		}], function (error, result) {
			if (error===-1) {
				console.log('passwd: ERROR in execution. exited early');
			} else {
				stdout.appendToBuffer("Finished");
				console.log('passwd Done');
			}
		});
    }

})();
