'use strict';
(function(){
    os.bin.remove = remove;

    function remove(fileName){
        if(os._internals.disk[fileName]) {
            delete os._internals.disk[fileName];
        } else {
            console.log("file does not exist");
        }
    }
})();