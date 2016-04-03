'use strict';
(function(){
    os.bin.remove = remove;

    os.ps.register('remove', remove, {stdout:true});

    function remove(options, argv){
        var onFailMsg ="The file " + argv[0] + " does not exist";
        var onSuccessMsg = "The file " + argv[0] + " does not exist";
        var stdout = options.stdout;

        if(os._internals.fs.disk[argv[0]]) {
            delete os._internals.fs.disk[argv[0]];
            console.log(onSuccessMsg);
        } else {
            console.log(onFailMsg);
            stdout.appendToBuffer(onFailMsg);
        }
    }
})();