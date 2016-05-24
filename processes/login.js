'use strict';
(function(){
    os.bin.login = login;

    os.ps.register('login', login, {stdin: loginListener, stdout:true});
	
	var stdout;
	var user;
	var pwd;
	var loginSteps;
	var userLine;
	var openTarget;

    function login(options, argv){
		stdout = options.stdout;
		loginSteps = 0;
		openTarget = "root/etc/shadow/User_Password.csv";
		
		stdout.appendToBuffer("----Login----");
		stdout.appendToBuffer("User: ");
    }
	
	function checkUser() {
		async.waterfall([
			// First we are going to get the length since that does not require the file to be open

		function (callback) {
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
		},

		/*
		This is the open function
		notice how its wrapped in another function the outside function is kind of
		like the required 'waterfall function'
		*/
		function (length, callback) {
			os.fs.open(openTarget, function (errorOpen, fh) {
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
	  
	  function (length, fh, fullData, callback) {
			// Now check the User_Password.csv file to see if the user is a registered user
			var searchMsg = "Searching Users ...";
			var lines = fullData.split("\n");

			stdout.appendToBuffer(searchMsg);

			userLine = search(lines, user);

			// Check if the user was found; if not, end and restart login
			if(userLine == "User Not Found") {
				// If an error in user, recall the login process (user must login before accessing CLI)
				os._internals.drivers.keyboard.deregisterStream();
				document.getElementById('textArea').innerHTML = "";
				stdout.appendToBuffer("User Not Found");
				os._internals.ps.copyProcessTableEntryToPCB('login');
				callback(-1);
				return;
			}
			else {
				stdout.appendToBuffer("User Found");
				stdout.appendToBuffer(user + " password: ");
				//callback(null, length, fh, fullData, lines, result);
			}		  
	  }], function (error, result) {
			if (error===-1)
				console.log('login: ERROR in execution. exited early');
		  });
	}
	
	//finds the user in the "file"
	function search(substr, key) {

    var foundUser = "-1";
	var row;

    for (row in substr) {
      var users =substr[row].split(",");
      if (users[0]===key){
		return substr[row];
		break;
      }
    }
      if(foundUser === "-1"){
        return "User Not Found";
      }
    }
	
	// Check the password against the User_Password.csv file to authenticate login
	function checkPassword() {
		// Extract the password
		var userPwd = userLine.split(",");
		
		// Incorrect password, try again
		if(userPwd[1] != pwd) {
			stdout.appendToBuffer("incorrect password");
			stdout.appendToBuffer(user + " password: ");
		} else { // Correct password login and deregister stream
			stdout.appendToBuffer("password accepted; welcome, " + user);
			
			os._internals.sec.curMode = os._internals.sec.modes.REG;
			os._internals.sec.user = user;

			loginSteps = 0;
			os._internals.drivers.keyboard.deregisterStream();
		}
	}
	
	function loginListener(stream) {
		var buf = stream.consumeBuffer();
		var input;
		
		if(loginSteps == 0) {
			// Get the username login
			input = buf.substr(11, buf.length - 11);
		
			// Get rid of leading blanks
			var i = 0;
			while(i < input.length && input[i] == ' ')
				i++;

			// Now get the user
			user = input.substr(i, input.length - i);
			loginSteps = 1;
			checkUser();
		} else {
			// Get the password
			input = buf.substr(11, buf.length - 11);
		
			// Get rid of leading blanks
			var i = 0;
			while(i < input.length && input[i] == ' ')
				i++;
		
			// Now get the pwd
			pwd = input.substr(i, input.length - i);
			
			checkPassword();
		}
	}
})();
