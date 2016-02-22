(function(){

os.fs.write = writeFile;

function writeFile(fileName, dataPar){

  os._internals.fs.disk[fileName]={

    data: dataPar,
    meta: {}
  };
}









})();