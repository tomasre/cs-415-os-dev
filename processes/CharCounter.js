/*
 * CharCount - Author:Darrel Daquigan
 * 
 * This process reads in a file and outputs a file of an array of
 * the number of occurences of each char in the input file
*/
'use strict';

(function () {

	var userMan = "[sourceFile] (optional) [destinationFile]";
	os.bin.CharCounter = CharCounter;
	os.ps.register('CharCounter', CharCounter, {stdout: true},userMan);

	function CharCounter(options, argv) {
		var stdout = options.stdout;

		var inputFile = argv[0];

		async.waterfall([
			//get input file length
			function (callback) {
				os.fs.length(inputFile, function (errorLength, length) {
					if (errorLength === -1){
						console.log('CharCounter data: error getting file length: ' +
							os.errno.errorCode + '\n');
						callback('Error');
					}
					else 
						callback(null, length);
				});
			},

			//open input file
			function (length, callback){
				os.fs.open(inputFile, function (errorOpen, fh){
					if (errorOpen === -1) {
						console.log(inputFile + ': error opening file:' +
							errorOpen + '\n');
						callback(errorOpen);
					} else {
						var openMsg = "Opening " + fh.name + " size: " + length;
						stdout.appendToBuffer(openMsg);
						callback(null, length, fh);
					}
				});
			},

			// read input file
			function (length, fh, waterfallCallBack) {
				var CHARS_TO_READ = ;
				var currentPosition = 0;
				var fullFile = '';

				function checkCompleted() {
					if (currentPosition >= length) 
						waterfallCallBack( null, length, fh, fullFile);
					else
						readNextBlock();
				}
				function readNextBlock() {
					var charCount = currentPosition + CHARS_TO_READ > length ?
						length - currentPosition : CHARS_TO_READ;

					os.fs.read(fh, charCount, function (errorRead, data) {
						if (errorRead === -1){
							console.log(inputFile + ": error reading file: \n");
							waterfallCallBack ('Error Read');
						} else {
							fullFile += data;

							os.fs.seek(fh, charCount, function (errorSeek) {
								if (errorSeek === -1) {
									console.log(inputFile + ": error seeking file:\n");
									waterfallCallBack('Error Seek');
								} else {
									currentPosition += charCount;
									checkCompleted();
								}
							});
						}
					});
				}
				checkCompleted();
			},

			//open output file
			function (length, fh, fullData, callback) {
				var result = countChars(fullData, length);
				var defaulDestination = "charCount.csv";

				var outputFile;

				
				if(argv.length === 2)
					outputFile = argv[1];
				else outputFile = defaulDestination;
				

				stdout.appendToBuffer("Exporting Char Count to " + outputFile);

				async.waterfall([
					//create output file
					function (callback) {
						os.fs.create(outputFile, function (errCreate, newFile){
							if (errCreate === -1) {
								console.log("error on create");
								callback("Error");
							} else {
								console.log('Success -------- new file created: ' + 
									newFile + os._internals.fs.disk);
								callback(null, newFile);
							}
						});
					},

					//write to output file
					function (writeTarget, recursivecallback) {
						var fullResult = result;
						var buffer = '';
						var CHARS_TO_WRITE = 5;
						var writeSize = result.length;
						var fileName;
						var writePosition = 0;

						function writeCompleted() {
							if (writePosition >= writeSize) 
								 recursivecallback(null, writeTarget, fileName);
							else
								writeNextBlock();
						}

						function writeNextBlock(){
							var writeEnd;
							if (writePosition + CHARS_TO_WRITE < writeSize)
								writeEnd = writePosition  + CHARS_TO_WRITE;
							else 
								writeEnd = writeSize;
							buffer = fullResult.substring(writePosition,writeEnd);

							os.fs.write(writeTarget, buffer, function (error, fileName) {
								if (error === -1){
									console.log(fileName + ': error writing' + error + '\n');
									callback('Error');
								} else {
									console.log("Write at Position: " + writePosition);
									writePosition = writePosition + CHARS_TO_WRITE;
									writeCompleted();
								}
							});
						}
						writeCompleted();
					},

					//close input file
					function (writeTarget,fileName,callback){
						os.fs.close(inputFile, function (errClose, msg){
							if (errClose === -1)
								console.log(msg);
							else
								callback(null);
						});
					}
				],

				function (err, writeResult) {
					if (err === -1) 
						console.log('Write Async Block failure');
					else 
						console.log('Write Async Block Success');
				});
			}
		],

		function (error, result) {
			if (error === -1) 
				console.log('CharCount: ERROR in execution. exited early');
			else {
				stdout.appendToBuffer("Finished");
				console.log('Get Initials Done');
			}
		});
	}

	function countChars(fullData, length) {
		var countArray = Array.apply(null, Array(128)).map(Number.prototype.valueOf,0);
		var posArray = Array.apply(null, Array(128)).map(Number.prototype.valueOf,0);

		for (var i = 0; i < 128; i++){
			os.ps.createThread(checkDone(i),allThreadsFinished);
		}

		function checkDone(charCode){
			std.out.appendToBuffer("CharCount running in seperate context");

			os.ps.pthread_mutexlock('PosArrayMutex',function (posArray){
				if(posArray[index] > length){
					os.ps.pthread_mutex_unlock('PosArrayMutex', function(){
						stdout.appendToBuffer('CharCount done running in seperatecontext');
					});
				}
				else
					checkChar(posArray, charCode);
			}
		}

		function checkChar(posArray, charCode){
			if (fullData.charAt(posArray[charCode]) == String.fromCharCode(charCode)){
				std.out.appendToBuffer("CharCount running in seperate context");
				os.ps.pthread_mutexlock('CountArrayMutex', function(countArray){
					countArray[charCode]++;
				})
				os.ps.pthread_mutex_unlock('CountArrayMutex', function(){
					stdout.appendToBuffer('CharCount done running in seperate context');
				});
			}
			posArray[charCode]++;
			os.ps.pthread_mutex_unlock('PosArrayMutex',function(){
					stdout.appendToBuffer('CharCount done running in seperatecontext');
				});
			checkDone(charCode);
		}
		checkDone();

		function allThreadsFinished(threadName) {
        	stdout.appendToBuffer('All threads for CharCount Finished --> last thread' + threadName);
			
		}

		var countString = "";
		var first = true;

		for (var i = 0; i< 128; i++){
			if (countArray[i] > 0){
				if (!first){
					countString += ", ";
				}
				countString += (String.fromCharCode(i) + ":" + countArray[i]);
				first = false;
			}
		}
		return countString;
	}

})();