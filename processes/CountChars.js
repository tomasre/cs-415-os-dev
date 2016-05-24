// Still need to clean up, get error handling finished, and add pipe functionality

'use strict';

(function () {
	  var userMan = " [filename] (optional) [destinationFile]\nResult array organized as follows:\n"+
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
		var openTarget;
		var destinationFile = "charArray.txt";
		var fullFile;
		var result = "";
		var length = -1;
		var charCount = [];
		for(var i = 0; i < 94; i++)
			charCount[i] = 0;
		var fileRead = false;
		var counted = false;
		var error = false;
		
		if (argv[0] == null)
			error = true;
		else
			openTarget = argv[0];
		
		if(argv[1] != null)
			destinationFile = argv[1];

        stdout = options.stdout;
        stdout.appendToBuffer('Creating threads\n');
		
		os.ps.pthread_mutex_lock('fs_ops lock', function(lockedData) {
			console.log("fs_ops lock");
		var thread_fs_ops = os.ps.createThread(function () {
            stdout.appendToBuffer('thread_fs_ops running in separate context with fs ops');

			// fs length op
			os.ps.pthread_mutex_lock('length lock', function(lockedData) {
				console.log("length lock");
				os.fs.length(openTarget, function (errorLength, length) {
					if (errorLength===-1) {
						console.log('thread_fs_ops length: ' + openTarget + ': error getting file length:');
						error = true;
					}
					
					//lockedData.length = length;

					os.ps.pthread_mutex_unlock('length lock', function() {
						console.log("length unlock");
						
						os.ps.pthread_mutex_lock('open lock', function(lockedData) {
							console.log("open lock");
							os.fs.open(openTarget, function (errorOpen, fh) {
								if (errorOpen === -1) {
									console.log('thread_fs_ops open: ' + openTarget + ': error opening file:');
									error = true;
								}
								//var openMsg = "thread_fs_ops open: Opening " + fh.name + " size: " + length;
								//stdout.appendToBuffer(openMsg);
								
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
										fullFile = '';

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
													//fileRead = true;
													counter(fullFile);
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
													error = true;

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
															error = true;
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

			
        }, fsThreadFinished);	
		os.ps.pthread_mutex_unlock('fs_ops lock', function() {
			console.log("fs_ops unlock");
		});
		});
		
		function counter(theText) {			
			stdout.appendToBuffer('counter threads running in separate context');
			os.ps.pthread_mutex_lock('counter lock', function(lockedData) {
				console.log("counter lock");
			var thread_a = os.ps.createThread(function () {
				console.log('Thread_a Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'a')
						charCount[0]++;
				}
			}, allThreadsFinished);

			var thread_b = os.ps.createThread(function () {
				console.log('Thread_b Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'b')
						charCount[1]++;
				}			
			}, allThreadsFinished);

			var thread_c = os.ps.createThread(function () {
				console.log('Thread_c Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'c')
						charCount[2]++;
				}			
			}, allThreadsFinished);

			var thread_d = os.ps.createThread(function () {
				console.log('Thread_d Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'd')
						charCount[3]++;
				}				
			}, allThreadsFinished);
			
			var thread_e = os.ps.createThread(function () {
				console.log('Thread_e Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'e')
						charCount[4]++;
				}				
			}, allThreadsFinished);
			
			var thread_f = os.ps.createThread(function () {
				console.log('Thread_f Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'f')
						charCount[5]++;
				}				
			}, allThreadsFinished);
			
			var thread_g = os.ps.createThread(function () {
				console.log('Thread_g Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'g')
						charCount[6]++;
				}				
			}, allThreadsFinished);
			
			var thread_h = os.ps.createThread(function () {
				console.log('Thread_h Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'h')
						charCount[7]++;
				}				
			}, allThreadsFinished);
			
			var thread_i = os.ps.createThread(function () {
				console.log('Thread_i Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'i')
						charCount[8]++;
				}				
			}, allThreadsFinished);
			
			var thread_j = os.ps.createThread(function () {
				console.log('Thread_j Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'j')
						charCount[9]++;
				}				
			}, allThreadsFinished);
			
			var thread_k = os.ps.createThread(function () {
				console.log('Thread_k Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'k')
						charCount[10]++;
				}				
			}, allThreadsFinished);
			
			var thread_l = os.ps.createThread(function () {
				console.log('Thread_l Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'l')
						charCount[11]++;
				}				
			}, allThreadsFinished);
			
			var thread_m = os.ps.createThread(function () {
				console.log('Thread_m Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'm')
						charCount[12]++;
				}				
			}, allThreadsFinished);
			
			var thread_n = os.ps.createThread(function () {
				console.log('Thread_n Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'n')
						charCount[13]++;
				}				
			}, allThreadsFinished);
			
			var thread_o = os.ps.createThread(function () {
				console.log('Thread_o Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'o')
						charCount[14]++;
				}				
			}, allThreadsFinished);
			
			var thread_p = os.ps.createThread(function () {
				console.log('Thread_p Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'p')
						charCount[15]++;
				}				
			}, allThreadsFinished);
			
			var thread_q = os.ps.createThread(function () {
				console.log('Thread_q Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'q')
						charCount[16]++;
				}				
			}, allThreadsFinished);
			
			var thread_r = os.ps.createThread(function () {
				console.log('Thread_r Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'r')
						charCount[17]++;
				}				
			}, allThreadsFinished);
			
			var thread_s = os.ps.createThread(function () {
				console.log('Thread_s Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 's')
						charCount[18]++;
				}				
			}, allThreadsFinished);
			
			var thread_t = os.ps.createThread(function () {
				console.log('Thread_t Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 't')
						charCount[19]++;
				}				
			}, allThreadsFinished);
			
			var thread_u = os.ps.createThread(function () {
				console.log('Thread_u Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'u')
						charCount[20]++;
				}				
			}, allThreadsFinished);
			
			var thread_v = os.ps.createThread(function () {
				console.log('Thread_v Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'v')
						charCount[21]++;
				}				
			}, allThreadsFinished);
			
			var thread_w = os.ps.createThread(function () {
				console.log('Thread_w Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'w')
						charCount[22]++;
				}				
			}, allThreadsFinished);
			
			var thread_x = os.ps.createThread(function () {
				console.log('Thread_x Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'x')
						charCount[23]++;
				}				
			}, allThreadsFinished);
			
			var thread_y = os.ps.createThread(function () {
				console.log('Thread_y Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'y')
						charCount[24]++;
				}				
			}, allThreadsFinished);
			
			var thread_z = os.ps.createThread(function () {
				console.log('Thread_z Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'z')
						charCount[25]++;
				}				
			}, allThreadsFinished);
			
			var thread_A = os.ps.createThread(function () {
				console.log('Thread_A Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'A')
						charCount[26]++;
				}				
			}, allThreadsFinished);
			
			var thread_B = os.ps.createThread(function () {
				console.log('Thread_B Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'B')
						charCount[27]++;
				}				
			}, allThreadsFinished);
			
			var thread_C = os.ps.createThread(function () {
				console.log('Thread_C Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'C')
						charCount[28]++;
				}				
			}, allThreadsFinished);
			
			var thread_D = os.ps.createThread(function () {
				console.log('Thread_D Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'D')
						charCount[29]++;
				}				
			}, allThreadsFinished);
			
			var thread_E = os.ps.createThread(function () {
				console.log('Thread_E Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'E')
						charCount[30]++;
				}				
			}, allThreadsFinished);
			
			var thread_F = os.ps.createThread(function () {
				console.log('Thread_F Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'F')
						charCount[31]++;
				}				
			}, allThreadsFinished);
			
			var thread_G = os.ps.createThread(function () {
				console.log('Thread_G Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'G')
						charCount[32]++;
				}				
			}, allThreadsFinished);
			
			var thread_H = os.ps.createThread(function () {
				console.log('Thread_H Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'H')
						charCount[33]++;
				}				
			}, allThreadsFinished);
			
			var thread_I = os.ps.createThread(function () {
				console.log('Thread_I Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'I')
						charCount[34]++;
				}				
			}, allThreadsFinished);
			
			var thread_J = os.ps.createThread(function () {
				console.log('Thread_J Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'J')
						charCount[35]++;
				}				
			}, allThreadsFinished);
			
			var thread_K = os.ps.createThread(function () {
				console.log('Thread_K Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'K')
						charCount[36]++;
				}				
			}, allThreadsFinished);
			
			var thread_L = os.ps.createThread(function () {
				console.log('Thread_L Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'L')
						charCount[37]++;
				}				
			}, allThreadsFinished);
			
			var thread_M = os.ps.createThread(function () {
				console.log('Thread_M Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'M')
						charCount[38]++;
				}				
			}, allThreadsFinished);
			
			var thread_N = os.ps.createThread(function () {
				console.log('Thread_N Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'N')
						charCount[39]++;
				}				
			}, allThreadsFinished);
			
			var thread_O = os.ps.createThread(function () {
				console.log('Thread_O Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'O')
						charCount[40]++;
				}				
			}, allThreadsFinished);
			
			var thread_P = os.ps.createThread(function () {
				console.log('Thread_P Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'P')
						charCount[41]++;
				}				
			}, allThreadsFinished);
			
			var thread_Q = os.ps.createThread(function () {
				console.log('Thread_Q Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'Q')
						charCount[42]++;
				}				
			}, allThreadsFinished);
			
			var thread_R = os.ps.createThread(function () {
				console.log('Thread_R Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'R')
						charCount[43]++;
				}				
			}, allThreadsFinished);
			
			var thread_S = os.ps.createThread(function () {
				console.log('Thread_S Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'S')
						charCount[44]++;
				}				
			}, allThreadsFinished);
			
			var thread_T = os.ps.createThread(function () {
				console.log('Thread_T Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'T')
						charCount[45]++;
				}				
			}, allThreadsFinished);
			
			var thread_U = os.ps.createThread(function () {
				console.log('Thread_U Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'U')
						charCount[46]++;
				}				
			}, allThreadsFinished);
			
			var thread_V = os.ps.createThread(function () {
				console.log('Thread_V Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'V')
						charCount[47]++;
				}				
			}, allThreadsFinished);
			
			var thread_W = os.ps.createThread(function () {
				console.log('Thread_W Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'W')
						charCount[48]++;
				}				
			}, allThreadsFinished);
			
			var thread_X = os.ps.createThread(function () {
				console.log('Thread_X Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'X')
						charCount[49]++;
				}				
			}, allThreadsFinished);
			
			var thread_Y = os.ps.createThread(function () {
				console.log('Thread_Y Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'Y')
						charCount[50]++;
				}				
			}, allThreadsFinished);
			
			var thread_Z = os.ps.createThread(function () {
				console.log('Thread_Z Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == 'Z')
						charCount[51]++;
				}				
			}, allThreadsFinished);
			
			var thread_0 = os.ps.createThread(function () {
				console.log('Thread_0 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '0')
						charCount[52]++;
				}				
			}, allThreadsFinished);
			
			var thread_1 = os.ps.createThread(function () {
				console.log('Thread_1 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '1')
						charCount[53]++;
				}				
			}, allThreadsFinished);
			
			var thread_2 = os.ps.createThread(function () {
				console.log('Thread_2 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '2')
						charCount[54]++;
				}				
			}, allThreadsFinished);
			
			var thread_3 = os.ps.createThread(function () {
				console.log('Thread_3 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '3')
						charCount[55]++;
				}				
			}, allThreadsFinished);
			
			var thread_4 = os.ps.createThread(function () {
				console.log('Thread_4 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '4')
						charCount[56]++;
				}				
			}, allThreadsFinished);
			
			var thread_5 = os.ps.createThread(function () {
				console.log('Thread_5 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '5')
						charCount[57]++;
				}				
			}, allThreadsFinished);
			
			var thread_6 = os.ps.createThread(function () {
				console.log('Thread_6 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '6')
						charCount[58]++;
				}				
			}, allThreadsFinished);
			
			var thread_7 = os.ps.createThread(function () {
				console.log('Thread_7 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '7')
						charCount[59]++;
				}				
			}, allThreadsFinished);
			
			var thread_8 = os.ps.createThread(function () {
				console.log('Thread_8 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '8')
						charCount[60]++;
				}				
			}, allThreadsFinished);
			
			var thread_9 = os.ps.createThread(function () {
				console.log('Thread_9 Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '9')
						charCount[61]++;
				}				
			}, allThreadsFinished);
			
			var thread_backQuote = os.ps.createThread(function () {
				console.log('Thread_backQuote Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '`')
						charCount[62]++;
				}				
			}, allThreadsFinished);
			
			var thread_tilda = os.ps.createThread(function () {
				console.log('Thread_tilda Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '~')
						charCount[63]++;
				}				
			}, allThreadsFinished);
			
			var thread_exclamation = os.ps.createThread(function () {
				console.log('Thread_exclamation Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '!')
						charCount[64]++;
				}				
			}, allThreadsFinished);
			
			var thread_at = os.ps.createThread(function () {
				console.log('Thread_at Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '@')
						charCount[65]++;
				}				
			}, allThreadsFinished);
			
			var thread_hash = os.ps.createThread(function () {
				console.log('Thread_hash Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '#')
						charCount[66]++;
				}				
			}, allThreadsFinished);
			
			var thread_dollar = os.ps.createThread(function () {
				console.log('Thread_dollar Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '$')
						charCount[67]++;
				}				
			}, allThreadsFinished);
			
			var thread_percent = os.ps.createThread(function () {
				console.log('Thread_percent Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '%')
						charCount[68]++;
				}				
			}, allThreadsFinished);
			
			var thread_caret = os.ps.createThread(function () {
				console.log('Thread_caret Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '^')
						charCount[69]++;
				}				
			}, allThreadsFinished);
			
			var thread_and = os.ps.createThread(function () {
				console.log('Thread_and Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '&')
						charCount[70]++;
				}				
			}, allThreadsFinished);
			
			var thread_star = os.ps.createThread(function () {
				console.log('Thread_star Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '*')
						charCount[71]++;
				}				
			}, allThreadsFinished);
			
			var thread_openParenthesis = os.ps.createThread(function () {
				console.log('Thread_openParenthesis Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '&')
						charCount[72]++;
				}				
			}, allThreadsFinished);
			
			var thread_closeParenthesis = os.ps.createThread(function () {
				console.log('Thread_closeParenthesis Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == ')')
						charCount[73]++;
				}				
			}, allThreadsFinished);
			
			var thread_dash = os.ps.createThread(function () {
				console.log('Thread_dash Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '-')
						charCount[74]++;
				}				
			}, allThreadsFinished);
			
			var thread_underscore = os.ps.createThread(function () {
				console.log('Thread_underscore Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '_')
						charCount[75]++;
				}				
			}, allThreadsFinished);
			
			var thread_equals = os.ps.createThread(function () {
				console.log('Thread_equals Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '=')
						charCount[76]++;
				}				
			}, allThreadsFinished);
			
			var thread_plus = os.ps.createThread(function () {
				console.log('Thread_plus Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '+')
						charCount[77]++;
				}				
			}, allThreadsFinished);
			
			var thread_openSquareBracket = os.ps.createThread(function () {
				console.log('Thread_openSquareBracket Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '[')
						charCount[78]++;
				}				
			}, allThreadsFinished);
			
			var thread_openCurlyBracket = os.ps.createThread(function () {
				console.log('Thread_openCurlyBracket Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '{')
						charCount[79]++;
				}				
			}, allThreadsFinished);
			
			var thread_closeSquareBracket = os.ps.createThread(function () {
				console.log('Thread_closeSquareBracket Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == ']')
						charCount[80]++;
				}				
			}, allThreadsFinished);
			
			var thread_closeCurlyBracket = os.ps.createThread(function () {
				console.log('Thread_closeCurlyBracket Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '&')
						charCount[81]++;
				}				
			}, allThreadsFinished);
			
			var thread_backslash = os.ps.createThread(function () {
				console.log('Thread_backslash Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '\\')
						charCount[82]++;
				}				
			}, allThreadsFinished);
			
			var thread_line = os.ps.createThread(function () {
				console.log('Thread_line Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '|')
						charCount[83]++;
				}				
			}, allThreadsFinished);
			
			var thread_semicolon = os.ps.createThread(function () {
				console.log('Thread_semicolon Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == ';')
						charCount[84]++;
				}				
			}, allThreadsFinished);
			
			var thread_colon = os.ps.createThread(function () {
				console.log('Thread_colon Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == ':')
						charCount[85]++;
				}				
			}, allThreadsFinished);
			
			var thread_quote = os.ps.createThread(function () {
				console.log('Thread_quote Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '\'')
						charCount[86]++;
				}				
			}, allThreadsFinished);
			
			var thread_doubleQuote = os.ps.createThread(function () {
				console.log('Thread_doubleQuote Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '\"')
						charCount[87]++;
				}				
			}, allThreadsFinished);
			
			var thread_comma = os.ps.createThread(function () {
				console.log('Thread_comma Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == ',')
						charCount[88]++;
				}				
			}, allThreadsFinished);
			
			var thread_openBracket = os.ps.createThread(function () {
				console.log('Thread_openBracket Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '<')
						charCount[89]++;
				}				
			}, allThreadsFinished);
			
			var thread_period = os.ps.createThread(function () {
				console.log('Thread_period Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '.')
						charCount[90]++;
				}				
			}, allThreadsFinished);
			
			var thread_closeBracket = os.ps.createThread(function () {
				console.log('Thread_closeBracket Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '>')
						charCount[91]++;
				}				
			}, allThreadsFinished);
			
			var thread_slash = os.ps.createThread(function () {
				console.log('Thread_slash Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '/')
						charCount[92]++;
				}				
			}, allThreadsFinished);
			
			var thread_question = os.ps.createThread(function () {
				console.log('Thread_question Running in separate context');
				for(var i = 0; i < theText.length; i++) {
					if(theText[i] == '?')
						charCount[93]++;
				}				
				
				os.ps.pthread_mutex_unlock('counter lock', function() {
					console.log("counter unlock");
					writeCountCharProcess(charCount, result, destinationFile, openTarget);
				});
			}, allThreadsFinished);

			});
		}
    }
	
	function writeCountCharProcess(charCount, result, destinationFile, openTarget) {
		//stdout.appendToBuffer('thread_fs_ops running in separate context with fs ops');
		
		// Turn the array into a string to be output to destinationFile
		for(var i = 0; i < charCount.length; i++) {
			result += i + ": " + charCount[i];

			if(i % 6 == 0 && i != 0)
				result += "\n";
			else
				result += " ";
		}
		console.log("result = " + result);

		os.ps.pthread_mutex_lock('create lock', function(lockedData) {
			console.log("create lock");
			os.fs.create(destinationFile, function (errCreate, newFile) {

				if (errCreate === -1) {
					console.log("error on create");
					//callback('Error');
					error = true;
				}
				console.log('Sucess--------- new file created:' + newFile);
				console.log(os._internals.fs.disk);	
				
				os.ps.pthread_mutex_unlock('create lock', function() {
					console.log("create unlock");
						
					os.ps.pthread_mutex_lock('write lock', function(lockedData) {
						var fullResult= result;
						var buffer='';
						var CHARS_TO_WRITE = 5;
						var writeSize=result.length;
						var fileName = "";
						var writePosition = 0;
							
						function writeCompleted() {
							if (writePosition >= writeSize) {
								os.ps.pthread_mutex_unlock('write lock', function() {
									console.log("write unlock");
									closeCountCharProcess(openTarget);
								});
							} else {
								// we need to read another block at least
								writeNextBlock();
							}
						}

						function writeNextBlock() {
							buffer = fullResult.substr(writePosition,CHARS_TO_WRITE);

							os.fs.write(newFile, buffer, writePosition, function (error, fileName) {

								if (error === -1) {
									console.log(newFile + ': error writing');
									console.log(error);
									console.log('\n');
									callback('Error');

								} else {
									//console.log("Write at Postion: " + writePosition);
									writePosition = writePosition + CHARS_TO_WRITE;
									writeCompleted();
								}
							});
						}
						writeCompleted();
					});
					
				});
			});
		});
		
	}
	
	function closeCountCharProcess(openTarget) {

			os.fs.close(openTarget,function(errClose,msg){

				if(errClose === -1){
					console.log(msg);
					error = true;
				}
				console.log(msg);
				//callback(null);
		});
	}

	function fsThreadFinished(threadName) {
		
	}
    function allThreadsFinished(threadName) {
		/*
		for(var i = 0; i < charCount.length; i++)
			console.log("charCount[i] = " + charCount[i] + " ");
		*/
        stdout.appendToBuffer('All threads for ThreadTest Finished --> last thread' + threadName);
    }
})();
