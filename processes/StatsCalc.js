/*
 * StatsCalc - Author:Darrel Daquigan
 * 
 * This process reads in a file of a list of names and ouputs 
 * a file of a list of corresponding initials
 * 
*/
'use strict';

(function () {

	var userMan = "[sourceFile] (optional) [destinationFile]";
	os.bin.StatsCalc = StatsCalc;
	os.ps.register('StatsCalc', StatsCalc, {stdout: true},userMan);
	var stdout;

	function StatsCalc(options, argv) {
		stdout = options.stdout;

		var inputFile = argv[0];

		async.waterfall([
			//get input file length
			function (callback) {
				os.fs.length(inputFile, function (errorLength, length) {
					if (errorLength === -1){
						console.log('initials data: error getting file length: ' +
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
				var CHARS_TO_READ = 100;
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

			//prepare output;
			function (length, fh, fullData, waterfallCallBack){
				var sampleArray = fullData.split(',');
				console.log(sampleArray);
				var sum = 0;

				for(var i = 0; i < 20; i++){
					os.ps.createThread(
						function(){
							os.ps.pthread_semaphore_lock('SampleArrayLock',function (sampleArray){
								os.ps.pthread_mutex_lock('SumLock',function (sum){
									for (var j = 0; j < Math.ceil(sampleArray.length/20);j++){
										if (i < 19 || j < sampleArray.length%20){
											sum += sampleArray[i*(sampleArray.length/20) + j];
										}
									}
									os.ps.pthread_mutex_unlock('SumLock',function(){});
								});
								os.ps.pthread_semaphore_unlock('SampleArrayLock',function(){});

						}, allThreadsFinished("thread " + i));
				}
				stdout.appendToBuffer("sum: " + sum);
				stdout.appendToBuffer("mean: " + sum/(sampleArray.length));
				var result = "passthreadtest";
				waterfallCallBack(null,length,fh,result);
			},

			//open output file
			function (length, fh, result, callback) {
				var defaulDestination = "newStats.csv";

				var outputFile;
				
				if(argv.length === 2)
					outputFile = argv[1];
				else outputFile = defaulDestination;
				

				stdout.appendToBuffer("Exporting Stats to " + outputFile);

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
							buffer = result.substring(writePosition,writeEnd);

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
				console.log('StatsCalc: ERROR in execution. exited early');
			else {
				stdout.appendToBuffer("Finished");
				console.log('StatsCalc Done');
			}
		});
	}
	function allThreadsFinished(threadName) {
		stdout.appendToBuffer("StatsCalc thread done: last thread - " + threadName);
	}

})();