'use strict';

(function () {
	  var userMan = " [filename] [destinationFile]\nResult array organized as follows:\n"+
		"	0:  a		15: p		30: E		45: T		60: 8		75: _		90: .\n" +
		"	1:  b	 	16: q		31: F		46: U		61: 9		76: =		91: >\n" +
		"	2:  c		17: r		32: G		47: V		62: `		77: +		92: /\n" +
		" 	3:  d		18: s		33: H		48: W		63: ~		78: [		93: ?\n" +
		"	4:  e		19: t		34: I		49:	X		64: !		79: {\n" +
		"	5:  f		20: u		35: J		50: Y		65: @		80: ]\n" +
		"	6:  g		21: v		36: K		51: Z		66: #		81: }\n" +
		" 	7:  h		22: w		37: L		52: 0		67: $		82: \\\n" +
		" 	8:  i		23: x		38: M		53: 1		68: %		83: |\n" +
		"	9:  j		24: y		39: N		54: 2		69: ^		84: ;\n" +
		"	10: k		25: z		40: O		55: 3		70: &		85: :\n" +
		"	11: l		26: A		41: P		56: 4		71: *		86: \'\n" +
		"	12: m		27: B		42: Q		57: 5		72: (		87: \"\n" +
		" 	13: n		28: C		43: R		58: 6		73: )		88: ,\n" +
		" 	14: o		29: D		44: S		59: 7		74: -		89: <\n"
    os.ps.register('CountChars', CountChars, {stdout: true}, userMan);

    var stdout;

    function CountChars(options, argv) {
		var sampleText = "abcd";
		var openTarget = "vector_data.csv";
		var length = -1;
		var charCount = [];
		for(var i = 0; i < 94; i++)
			charCount[i] = 0;

        stdout = options.stdout;
        stdout.appendToBuffer('Creating threads\n');
		
		var thread_fs_ops = os.ps.createThread(function () {
            stdout.appendToBuffer('thread_fs_ops running in separate context with fs ops');

			// fs length op
			os.ps.pthread_mutex_lock('length lock', function(lockedData) {
				console.log("length lock");
				os.fs.length(openTarget, function (errorLength, length) {
					if (errorLength===-1) {
						console.log('thread_length: ' + openTarget + ': error getting file length:');
					}
					
					stdout.appendToBuffer('thread_length: ' + openTarget + ' length: ' + length);
					//lockedData.length = length;

					os.ps.pthread_mutex_unlock('length lock', function() {
						console.log("length unlock");
						
						os.ps.pthread_mutex_lock('open lock', function(lockedData) {
							console.log("open lock");
							os.fs.open(openTarget, function (errorOpen, fh) {
								if (errorOpen === -1) {
									console.log('thread_open: ' + openTarget + ': error opening file:');
								}
								var openMsg = "thread_open: Opening " + fh.name + " size: " + length;
								stdout.appendToBuffer(openMsg);
								
								os.ps.pthread_mutex_unlock('open lock', function() {
									console.log("open unlock");
									
									os.ps.pthread_mutex_lock('read lock', function(lockedData) {
										console.log("read lock");
										// fs seek and read ops
										// we want to read and seek until position === length
										// our position is currently at 0

										// THIS IS SMALL TO SHOW MULTIPLE READS
										var CHARS_TO_READ = 100;

										// THIS IS TO KEEP TRACK OF WHERE WE ARE IN THE FILE
										var currentPosition = 0;

										// THIS IS WHERE THE FILE DATA IS STORED
										var fullFile = '';

										//after every read and seek checkCompleted checks to see if its done
										//note this has ZERO asynchronous operations
										function checkCompleted() {
											if (currentPosition >= length) {
												// WE ARE DONE READING THE WHOLE FILE,
												// we can move on with the waterfall
												// note we are passing all the data we have got so far to the next waterfall function
												//waterfallCallback(null, length, fh, fullFile);
												os.ps.pthread_mutex_unlock('read lock', function() {
													console.log("read unlock");
													countTheChars(fullFile);
												});
											} else {
												// we need to read another block at least
												readNextBlock();
											}
										}

										//reads the next block of data, then seeks forward that amount, then calls check completed to
										//see if it needs to read more before finishing
										//NOTE: this function has two asynchronous fs operations
										function readNextBlock() {
											// if there is one character left in the file, dont read 100
											var charCount = currentPosition + CHARS_TO_READ > length ? length - currentPosition : CHARS_TO_READ;

											os.fs.read(fh, charCount, function (errorRead, data) {
												if (errorRead===-1) {
													// ERROR on the read not continuing
													console.log(openTarget + ': error reading file:');
													//console.log(errorCode);
													console.log('\n');

													// note calling waterfall function to exit this whole read 'asynchronous loop'
													//waterfallCallback('Error Read');

												} else {
													// read was successful
													// append the data we got
													fullFile += data;
													//console.log('VM: read success---------');
													// now we seek forward what we just read
													os.fs.seek(fh, charCount, function (errorSeek) {
														if (errorSeek===-1) {
															// ERROR on the seek not continuing
															console.log(openTarget + ': error seeking file:');
															//console.log(errorCode);
															console.log('\n');

															// note calling waterfall function to exit this whole seek 'asynchronous loop'
															//waterfallCallback('Error Seek');

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
									});
								});
							});
						});
					});
				});
			});

			
        }, allThreadsFinished);	

		function countTheChars(theText) {
			console.log("theText = " + theText);
			var thread_a = os.ps.createThread(function () {
				stdout.appendToBuffer('Thread_a Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(sampleText[i] == 'a')
						charCount[0]++;
				}
			}, allThreadsFinished);

			var thread_b = os.ps.createThread(function () {
				stdout.appendToBuffer('Thread_b Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(sampleText[i] == 'b')
						charCount[1]++;
				}			
			}, allThreadsFinished);

			var thread_c = os.ps.createThread(function () {
				stdout.appendToBuffer('Thread_c Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(sampleText[i] == 'c')
						charCount[2]++;
				}			
			}, allThreadsFinished);

			var thread_d = os.ps.createThread(function () {
				stdout.appendToBuffer('Thread_d Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(sampleText[i] == 'd')
						charCount[3]++;
				}				
			}, allThreadsFinished);
		}
    }

    function allThreadsFinished(threadName) {
		/*
		for(var i = 0; i < charCount.length; i++)
			console.log("charCount[i] = " + charCount[i] + " ");
		*/
        stdout.appendToBuffer('All threads for ThreadTest Finished --> last thread' + threadName);
    }
})();
