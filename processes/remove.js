'use strict';
(function(){
    os.bin.remove = remove;

    function remove(fileName){
        if(os._internals.fs.disk[fileName]) {
            delete os._internals.fs.disk[fileName];
            console.log(os._internals.fs.disk[fileName]);
        } else {
            console.log("file does not exist");
        }
    }
})();