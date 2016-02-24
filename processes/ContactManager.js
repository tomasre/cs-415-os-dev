(function(){

  var fileSize = os._internals.fs.disk['Contact_Data'].data.length;
  var resultStrPosition= 0;
  var data;
  var finishedReading = false;
  var finishedWriting = false;
  var searchKey = "jimmy";
  var IO_CHAR_RESTRICTION = 100;

  op.ps.register('ContactManager', main);

  function main() {

    os.fs.openFile('Contact_Data.csv', function(errorOpen, filehandle){
      if (errorOpen){

        console.log(errorOpen);

      } else {


        while(finishedReading===false){

        os.fs.readFile(filehandle.name,IO_CHAR_RESTRICTION,function(errorRead, dataPar){

          if(errorRead){

            console.log(errorRead);

          } else {

            data = data + dataPar;
            seekFile(filehandle.name, IO_CHAR_RESTRICTION, function(errorSeek){

              if (errorSeek){

                console.log(errorSeek);

              } else {

                if (data.length >== fileSize){
                  finishedLoading = true;

                }
              }

            });

          }


        });
      }
    }
  });



      var result = search(data,searchKey);
      console.log("Contact Found: " + result);
      var destinationFile = "newContact.csv";


      os.ps.create(destinationFile, function(errorCreate,fileName){
        if(errorCreate){
          console.log(errorCreate);
        } else {
      while(finishedWriting === false){
      os.ps.write(filename,result.substring(resultStrPosition,IO_CHAR_RESTRICTION) function(errorWrite,writeFile){

        if(errorWrite){

          console.log(seekError)

        } else {

          resultStrPosition = resultStrPosition + IO_CHAR_RESTRICTION;

          if(resultStrPosition >== result.length){

            finishedWriting = true;
          }
        }

      });
    }
  }
});
}


    
  

function search(csvFileData, contact){
  var newString;
  var substr = csvFileData.split("\n");

  for (row in substr) {
    console.log(substr[row]);
    var entry = "";
    entry = substr[row];
    if(entry[0]===contact){
      newString = entry.join(",");
    }
  }

  return newString;

}
  



})();