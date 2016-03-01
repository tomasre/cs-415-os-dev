'use strict'

(function() {
  // Register the entry point, main with process named "Bank"
  os.ps.register('Bank', main);
  
  // input file name should be called "Stats_Data.csv" and output file should be named "Average.csv"
  var FNAME_IN = "Bank_Transactions.csv";
  var FNAME_OUT = "Total_Balance.csv";
  
  var balance = 0;
  
  var main = function() {
    // attempts to open the file "Stats_Data.csv"
    os.fs.open(FNAME_IN, function(errorOpen, fh) ) {
      // if error has something, we output the error and stop the process(e?)
      if(errorOpen) {
        console.log("Error(1): " + errorOpen);
      } else {
        // read data from the "Stats_Data.csv" file 100 characters at a time
        os.fs.read(fh, 100, function(errorReadingFile, data) ) {
          // if error occurs while reading, output error message and stop process(e?)
          if(errorReadingFile) {
            console.log("Error(2): " + errorReadingFile);
          } else {
            // take the sum received from the list
            for(var i = 0; i < data.length; i++) {
              balance += data[i];
            }
             os.fs.close(FNAME_IN, function(errorClosingFile, errorMessage)) {
              // output an error message if an error occurs, and stop the process(e?)
              if(errorClosingFile) {
                console.log("Error(3): " + errorMessage);
              } else {
                // tell the file system to create a new file with the name "Average.csv"
                os.fs.create(FNAME_OUT, function(errorCreatingFile, writeFile) ) {
                  // output the error message if an error occurs, and stop the process(e?)
                  if (errorCreatingFile) {
                    console.log("Error(4): " + errorCreatingFile);
                  } else {
                    // write the number stored in result into the new file "Average.csv"
                    os.fs.write(FNAME_OUT, balance, function(error, fileName) ) {
                      if(error) {
                        // error message....repeat and output etc.
                        console.log("Error(5): " + error);
                      } else {
                        // we have finished, tell the file system we are done by closing the file "Average.csv"
                        os.fs.close(FNAME_OUT, function(errorClosingFile, errorMessage)) {
                          if(errorClosingFile) {
                            // error message....repeat and output etc.
                            console.log("Error(4): " + errorMessage);
                          } else {
                            console.log("Here is the balance of the account.");
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }  
    }
  }
})();
