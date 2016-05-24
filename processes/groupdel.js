(function() {
// NEW Register process now contains a Manual Property that takes a string which will be displayed
  // when the user types man process name
  var userMan = " [group] [user]";
  
  var stdout;
  var group;
  var oldUser;
  var lines;
  var newFileData;
  var openTarget;
  var userFile;

  os.bin.groupdel = groupdel;
  os.ps.register('groupdel', groupdel, {stdout: true}, userMan);

  function groupdel(options, argv) {
	stdout = options.stdout;
	userFile = "User_Password.csv";

	group = argv[1];
	oldUser = argv[2];
	
	openTarget = 'Groups.csv';

    async.waterfall([

		// First we are going to get the length since that does not require the file to be open

		function (callback) {
			os.fs.length(openTarget, function (errorLength, length) {
				//if -1 is "returned" an error has occurred
				//the proper error UNIX/C error message will be printed
				if (errorLength === -1) {
					console.log('Groups.csv: error getting file length:');
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
      },

      /*
       This is the open function
       notice how its wrapped in another function the outside function is kind of
       like the required 'waterfall function'
       */
      function (length, callback) {
		os.fs.open(openTarget, function (errorOpen, fh) {
			if (errorOpen === -1) {
				console.log('Groups.csv: error opening file:');
				console.log(errorOpen);
				console.log('\n');
				// AN ERROR OCCURRED BREAK THE WATERFALL 'CHAIN'
				callback(errorOpen);

			} else {
				// NOTE: this is passing the length and fh to the next waterfall function
				//console.log('VM: open success---------');
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
					console.log('Groups.csv: error reading file:');
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
							console.log('Groups.csv: error seeking file:');
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
      },

      function (length, fh, fullData, callback) {	
		lines = fullData.split("\n");
			
		// Find the group, and add the user if found
		var groupFound = false;
		
		// Open and read User_Password.csv to see if the user is a valid user
		async.waterfall([
			function (callback) {				
				os.fs.length(userFile, function (errorLength, length) {
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
			},
		
			function (length, callback) {
				os.fs.open(userFile, function (errorOpen, fh) {
					if (errorOpen === -1) {
						console.log('User_Password.csv: error opening file:');
						console.log(errorOpen);
						console.log('\n');
						// AN ERROR OCCURRED BREAK THE WATERFALL 'CHAIN'
						callback(errorOpen);

					} else {
						// NOTE: this is passing the length and fh to the next waterfall function
						//console.log('VM: open success---------');
						callback(null, length, fh);
					}
				});
			},

			function (length, fh, waterfallCallback) {
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
			},
		
			// Now search the User_Password.csv file for the user
			function (length, fh, fullData, callback) {
				var userLines = fullData.split("\n");
				var userFound = false;
				
				for(var i = 0; i < userLines.length; i++) {
					var userLine = userLines[i].split(",");
				
					if(userLine[0] == oldUser) {
						userFound = true;
						break;
					}
				}
			
				// If user not found, end the process
				if(userFound == false) {
					stdout.appendToBuffer("Not a current user; add user account first");
					callback(-1);
					return;
				} else {
					console.log("User found");
				}
				
				// Find the specified group
				for(var i = 0; i < lines.length; i++) {
					var theGroup = lines[i].split(",");
					if(theGroup[0] == group) {
						// Find the user
						for(var j = 1; j < theGroup[j].length; j++) {
							if(theGroup[j] == oldUser) {
								// Remove the user
								console.log("Removing user");
								stdout.appendToBuffer("Removing user from group" + group + "...");
								theGroup[j] = "";
								break;
							}
						}
						lines[i] = theGroup.join(",");
						groupFound = true;
						break;
					}
				}

				// If the group was found, proceed to add user; otherwise end process
				if(!groupFound) {
					stdout.appendToBuffer("Group not found");
					callback(-1);
					return;
				}

				newFileData = lines.join("\n");

				// Write to Groups.csv
				async.waterfall([
					function (callback) {				
						var fullResult= newFileData;
						var buffer='';
						var CHARS_TO_WRITE = 5;
						var writeSize=newFileData.length;
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
									console.log('Groups.csv: error writing');
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
						os._internals.ps.copyProcessTableEntryToPCB('loadGroups');
						os.fs.close(openTarget,function(errClose,msg){
							if(errClose === -1){
								console.log(msg);
							} else {
								console.log(msg);
								recursivecallback(null, fullResult, userFile);
							}
						});
					},
					
					function (fullResult, userFile, recursivecallback) {
						os.fs.close(userFile,function(errClose,msg){
							if(errClose === -1){
								console.log(msg);
							} else {
								console.log(msg);
								recursivecallback(null);
							}
						});
					}], function (error, result) {
							if (error===-1) {
								console.log('groupdel: ERROR in execution. exited early');
							} else {
								console.log('Groups.csv updating...');
							}
					});
			}], function (error, result) {
				if (error===-1) {
					console.log('groupdel: ERROR in execution. exited early');
				} else {
					stdout.appendToBuffer("Finished");
					console.log('groupdel Done');
				}
		});
	}], function (error, result) {
			if (error===-1)
				console.log('groupdel: ERROR in execution. exited early');
	});
  }  
})();
