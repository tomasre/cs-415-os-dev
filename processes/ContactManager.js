(function(){

  var fileSize = os._internals.fs.disk['Contact_Data'].data.length;
  var data;
  var finishedLoading = false;
  var searchKey = "jimmy";

  op.ps.register('ContactManager', main);

  function main() {

    os.fs.openFile('Contact_Data.csv', function(errorOpen, filehandle){
      if (errorOpen){

        console.log(errorOpen);

      } else {


        while(finishedLoading===false){
        os.fs.readFile(filehandle.name,100,function(errorRead, dataPar){
          if(errorRead){
            console.log(errorRead)
          } else {
            data = data + dataPar;
            seekFile(filehandle.name, 100, function(errorSeek){
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

      var result = search(data,search);
      var destinationFile = "newContact.csv";



      os.ps.write(destinationFile,result, function(seekError){
        if(seekError){
          console.log(seekError)
        } else {
          os.ps.close('Contact_Data',function(closeError){
            console.log(closeError);


          });

        }
      });

      


  }

}


      }


    }
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