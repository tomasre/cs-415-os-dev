/**
  * more.js
  
  * 'more' command for CLI
  * Created by Matt Kindblad on 03/29/2016.
  
  *All of the code for opening and reading the file copied from ContactManager.js
  *When end of file reach, 'END' string passed back instead of page object.
  
  * Tested page creation and page/line advancing 
  * on 03/30/2016, works properly; still need to test
  * opening and reading of file (all code from ContactManager.js)
 */

'use strict'
(function() {
	
	function more(source) {
		async.waterfall([
		
			/**
			  * First we are going to get the length since that does not requre the file to be open
			  */
			function(callback) {
				os.fs.length(source, function(errorLength, length) {
					// If -1 is "returned" an error has occured
					if(errorLength === -1) {
						console.log('more request: error getting file length:');
						console.log('\n');
						callback('Error');
					}
					else {
						callback(null, length);
					}
			
				});
			},
			
			/**
			  * Open function
			  */
			function(length, callback) {
				os.fs.length(source, function(errorOpen, fh) {
					if(errorOpen === -1) {
						console.log('more request for file ' + source + ': error opening file:');
						console.log(errorOpen);
						console.log('\n');
						callback(errorOpen);
					}
					else {
						callback(null, length, fh);
					}
				});
			},

			/**
				Read function
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
						if (errorRead) {
							// ERROR on the read not continuing
							console.log('Contact_Data.csv: error reading file:');
							console.log(errorRead);
							console.log('\n');

							// note calling waterfall function to exit this whole read 'asynchronous loop'
							waterfallCallback(errorRead);

						} else {
							// read was successful
							// append the data we got
							fullFile += data;
							console.log('VM: read success---------');

							// now we seek forward what we just read
							os.fs.seek(fh, charCount, function (errorSeek) {
								if (errorSeek) {
									// ERROR on the seek not continuing
									console.log('Contact_Data.csv: error seeking file:');
									console.log(errorSeek);
									console.log('\n');

									// note calling waterfall function to exit this whole seek 'asynchronous loop'
									waterfallCallback(errorSeek);

								} else {
									currentPosition += charCount;
									console.log('VM: seek success---------');
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
			
			function(length, fh, fullData, callback) {
				// pageWidth & pageLines are arbitrary #s until we decide the size of the page
				var pageWidth = 150;
				var pageLines = 9;
				
				// Split the file into an array of lines ('\n' is delimiter)
				var lines = [];
				lines = fullData.split("\n");
				
				// Account for the pageWidth, and word-wrap if necessary.
				for(var i = 0; i < lines.length; i++) {
					if (lines[i].length > pageWidth) {
						lines.splice(i+1, 0, lines[i].substr(pageWidth, lines[i].length - pageWidth));
						lines[i] = lines[i].substr(0, pageWidth);
					}
				}
				
				/**
				  Still need to work out the function calls/callback in my head, if the CLI 
				  will be calling the functions below, might want to make lines static so it 
				  won't be necessary to pass it within the object
				 */
				
				// 1st page
				var page = {currentLines: lines.slice(0, 9), allLines: lines, ptrFirstLine: 0, ptrLastLine: 8};

				/**
				  Send page to display device.
				  Need to study the CLI and display driver to know how to interact.
				  Using the page commands from the CLI, will shift the lines by 1 for advancing
				  1 line, or pageLines for 1 page:
				  
				  ENTER: Advance one line
				  SPACE: Advance one page
				  
				  Functions for these are below
				  
				  The 'more' command doesn't necessarily go back a page, although later implementations
				  apparently can do this.  I don't think we need to bother, but we can implement
				  if we want; if we don't want, maybe modify code to shift() previous lines away.
				  
				  There a number of optional arguments that we could implement, should we bother 
				  with them?  There are about 10 of them...
				  
				  Also will we need to 'close' the file?  I didn't see any code for this in the contactManager...
				 */
			}
		],
		function(error, result) {
			if (error) {
				console.log('more command: ERROR in execution. exited early');
			} else {
				console.log('more command done');
			}
		});	
	}
	
	// ENTER pressed; advance one line
	function advanceLine(thePage) {
		// If we're on the last page and there are still lines on the page, move only the first line ptr
		if(thePage.ptrLastLine+1 > thePage.allLines.length - 1 && thePage.currentLines.length > 1) {
			thePage.currentLines = thePage.allLines.slice(thePage.ptrFirstLine+1, thePage.ptrLastLine + 1);
			thePage.ptrFirstLine++;
		}			
		// If we're on the last page and there's only one line left, send a message to end the display of the file
		else if(thePage.ptrLastLine+1 > thePage.allLines.length - 1)
			thePage = 'END';
			
		// Otherwise shift the page by one line
		else {
			thePage.currentLines = thePage.allLines.slice(thePage.ptrFirstLine+1, thePage.ptrLastLine+2);
			thePage.ptrFirstLine++;
			thePage.ptrLastLine++;
		}
			
		return thePage;
	}
				 
	// SPACE pressed; advance one page
	function advancePage(thePage) {
		// If we're already on the last page, send a message to end the display of the file
		if(thePage.ptrLastLine == thePage.allLines.length - 1)
			thePage = 'END';
		// If the next page is the last line, only display up to the last line
		else if(thePage.ptrLastLine + 9 > thePage.allLines.length - 1) {
			thePage.currentLines = thePage.allLines.slice(thePage.ptrFirstLine+9, thePage.allLines.length);
			thePage.ptrFirstLine += 9;
			thePage.ptrLastLine = thePage.allLines.length - 1;
		}
		// Otherwise load the next page		
		else {
			thePage.currentLines = thePage.allLines.slice(thePage.ptrFirstLine+9, thePage.ptrLastLine+10);
			thePage.ptrFirstLine += 9;
			thePage.ptrLastLine += 9;
		}		
					 
		return thePage;
	}
	
})();
