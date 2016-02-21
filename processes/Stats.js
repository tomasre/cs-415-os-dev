(function() {
  /* The input file should be called Stats_Data.csv and the output file is average.csv */
  var szFName_In = "Stats_Data.csv";
  var szFName_Out = "average.csv";
  var total = 0;

  // try to open the file, if file exists we perform operation, if not we throw error
  try {
    // csv file is comma separated, so we delimit the string based on commas
    var file = os.fs.open(szFName_In);
    var values = file.split(",");
    
    // sum up all the values from the array of numbers we took from the file and store into the total
    for (var i = 0; i < values.length; i++) {
      total += values[i];
    }
    total = total / values.length;
    
    // Missing a create output file, and writing to the output file
    os.fs.close(szFName_In);
  } catch (e) {
    console.log("Error could not open: " + e);
  }
})();
