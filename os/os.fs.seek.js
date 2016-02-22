(function(){
  os.fs.seek = seekFile

  function seekFile(fileHandle, charsRead){

    var x = os._internals.fs.disk[fileHandle.name].meta.pos;

    os._internals.fs.disk[fileHandle.name].meta.pos = charsRead + x;


    // missing call back not sure what it should be




  }













})();