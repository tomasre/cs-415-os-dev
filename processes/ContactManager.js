(function() {
  var targetFile = 'Contact_Data.csv';

  var searchKey = "mike";

  os.ps.register('ContactManager', main);

  function main() {
    async.waterfall([

      /*
       First we are going to get the length since that does not require the file to be open
       */
      function (callback) {
        os.fs.length(targetFile, function (errorLength, length) {
          //if -1 is "returned" an error has occured
          //the proper error UNIX/C error message will be printed
          if (errorLength === -1) {
            console.log('contact data: error getting file length:');
            //console.log(os.errno.errorCode);
            console.log('\n');
            // NOTE there was an error so we pass an error to the callback
            callback('Error');

          } else {
            console.log('VM: length success---------');
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
        os.fs.open(targetFile, function (errorOpen, fh) {
          if (errorOpen === -1) {
            console.log('Contact_Data.csv: error opening file:');
            console.log(errorOpen);
            console.log('\n');
            // AN ERROR OCCURRED BREAK THE WATERFALL 'CHAIN'
            callback(errorOpen);

          } else {
            // NOTE: this is passing the length and fh to the next waterfall function
            console.log('VM: open success---------');
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
              console.log('Contact_Data.csv: error reading file:');
              //console.log(errorCode);
              console.log('\n');

              // note calling waterfall function to exit this whole read 'asynchronous loop'
              waterfallCallback('Error Read');

            } else {
              // read was successful
              // append the data we got
              fullFile += data;
              console.log('VM: read success---------');

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

      function (length, fh, fullData, callback) {

        var result = search(fullData, searchKey);
        console.log("Contact Found: " + result);
        var destinationFile = "newContact.csv";

        os.fs.write(destinationFile, result, function (error) {
          if (error) {
            console.log('Contact_Data.csv: error writing');
            console.log(error);
            console.log('\n');
            callback(error);
          } else {
            console.log("Done");
            callback(null);
          }

        });
      }], function (error, result) {
      if (error) {
        console.log('Contact_Data: ERROR in execution. exited early');
      } else {
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