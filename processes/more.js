'use strict';

(function() {

	function more(options, argv) {
		var stdout = options.stdout;
		var sourceFile = argv[0];

		async.waterfall([
			//get file length
			function (callback) {
				os.fs.length(sourceFile, function ( errorLength, length){
					if (errorLength === -1) {
						console.log('more data: error getting file length: ' +
							os.errno.errorCode + '\n');
						callback('Error');
					}
					else
						callback(null, length);
				});
			},

			//open file
			function (length, callback){
				os.fs.open(sourceFile, function (errorOpen, fh){
					if (errorOpen === -1) {
						console.log(sourceFile + ': error opening file:' +
							errorOpen + '\n');
						callback('Error Open');
					} else {
						var openMsg = "Opening " + fh.name + "size: " + length;
						stdout.appendToBuffer(openMsg);
						callback(null, length, fh);
					}
				});
			},

			//read file
			function (length, fh, waterfallCallBack){
				var CHARS_TO_READ = 100;
				var currentPosition = 0;
				var fillFile = '';

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

			//close file
			function (length,fh,fullFile,callback){
				os.close(sourceFile, function (errClose,msg){
					if (errClose === -1)
						console.log(msg);
					else
						callback(null, length, fh, fullFile);
				});
			},

			//display file
			function (length, fh,fullFile,callback){
				var pageLength = 20;
				var pageWidth = 100;
				var startLine = 0;
				var endLine = 0;
				var userInput = '';
				var lines = splitLines(fullFile);

				function checkEOF(){
					if ( lines.length - startLine < pageLength){
						for (var i = 0; i < lines.length; i++){
							stdout.appendToBuffer(lines[i] + '\n');
						}
						waterfallCallBack(null);
					}
					else{
						endLine = startLine + pageLength - 1;
						for (var i = 0; i < endLine; i++){
							stdout.appendToBuffer(lines[startLine + i] + '\n');
						}
						stdout('--more--' + '\n');
						getCommand();
					}
				}

				function getCommand(){
					//not sure how this next line should be implemented
					os.driver.keyboard.addKeyListener('keypress', function (e) {
						switch (e.keyCode){
							case 32: //enter - scroll forward one line
								startLine += pageLength -1;
								endLine = startLine;
								checkEOF();
								break;
							case 32: // (space) - scroll forward one page
								startLine++;
								endLine = startLine;
								checkEOF();
								break;
							case 81: // q - quit
								waterfallCallBack(null)
								break;
						}
					});
				}

			}

		]);
	}

	function splitLines(fullFile){
		var lines = [];
		lines = fullFile.split("\n");

		for (var i = 0; i< lines.length; i++){
			if (lines[i].length > pageWidth){
				lines.splice(i+1, lines[i].substr(pageWidth, lines[i].length - pageWidth));
				lines[i] = lines[i].substr(0, pageWidth);
			}
		}
		return lines;
	}
})();