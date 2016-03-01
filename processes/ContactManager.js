(function(){

  var fileSize;
  var TARGETFILE = 'Contact_data.csv';
  var resultStrPosition= 0;
  var data;
  var finishedReading = false;
  var finishedWriting = false;
  var searchKey = "jimmy";
  var IO_CHAR_RESTRICTION = 100;

  os.ps.register('ContactManager', main);

  function main() {
    async.waterfall([
      function(callback){

        os.fs.length(TARGETFILE, function(lengthError, size){
          console.log("CM LENGTH START");
          if(lengthError){
            console.log(lengthError);
          } else {
            fileSize = size;
          }

        });








      }

        console.log("Contact Manger START");
    os.fs.open('Contact_Data.csv', function(errorOpen, filehandle){
      console.log("CM OPEN START");
      if (errorOpen){

        console.log(errorOpen);

      } else {

        os.fs.length(filehandle.name,function(lengthError, size){
            console.log("CM LENGTH START");
          if(lengthError){
            console.log(lengthError);
          } else {
            fileSize = size;
          }

        });

        while(finishedReading===false){

        os.fs.read(filehandle.name,IO_CHAR_RESTRICTION,function(errorRead, dataPar){
            console.log("read start");
          if(errorRead){

            console.log(errorRead);

          } else {

            data = data + dataPar;
            os.fs.seek(filehandle.name, IO_CHAR_RESTRICTION, function(errorSeek){

              if (errorSeek){

                console.log(errorSeek);

              } else {
                os.fs.eof(filehandle,function(msg, end){
                  if(end === true){
                    finishedReading = true;
                  }
                  console.log(msg);

                });
              }
            });
          }
        });
      }
        var result = search(data,searchKey);
        console.log("Contact Found: " + result);
        var destinationFile = "newContact.csv";


        os.ps.create(destinationFile, function(errorCreate,fileName){

          if(errorCreate){
            console.log(errorCreate);

          } else {

            while(finishedWriting === false){
              os.ps.write(fileName,result.substring(resultStrPosition,IO_CHAR_RESTRICTION),function(errorWrite,writeFile){

                if(errorWrite){

                  console.log(errorWrite);

                } else {

                  resultStrPosition = resultStrPosition + IO_CHAR_RESTRICTION;

                  if(resultStrPosition >= result.length){

                    finishedWriting = true;
                  }
                }

              });
            }
          }
        });
    }


  });




}


    
  

  function search(csvFileData, contact){
    var newString;
    var substr = csvFileData.split("\n");

    for (var row in substr) {
      console.log(substr[row]);
      var entry = "";
      entry = substr[row];
      if(entry[0]===contact){
        newString = entry.join(",");
    }
  }

  return newString;

}
 /*
  function openEntryP(errorOpen,fileHandle){

  }

  function lengthEntryP(errorOpen,fileHandle){

  }

  function readEntryP(errorRead,subString){

  }

  function seekEntryP(errorSeek){

  }

  function createEntryP(errorCreate, fileName){

  }

  function writeEntryP(errorWrite){

  } */





})();