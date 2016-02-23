'use strict'

(function() {
  // Register the entry point, main with process named "Stats"
  os.ps.register('Stats', main);
  
  // input file name should be called "Stats_Data.csv" and output file should be named "Average.csv"
  var FNAME_IN = "Stats_Data.csv";
  var FNAME_OUT = "Average.csv";
  
  var main = function() {
    os.fs.open(FNAME_IN, function(errorOpen, fh) ) {
      if(errorOpen) {
        console.log("Could not open file: " + errorOpen);
      } else {
        os.fs.read(fh, 100, function(errorReadingFile, data) ) {
          if(errorReadingFile) {
            console.log("Error reading the file: " + errorReadingFile);
          } else {
            var result = 0;
            for(var i = 0; i < data.length; i++) {
              result += data[i];
            }
            
          }
        }
      }  
    }
  }
}
}
  
})();
