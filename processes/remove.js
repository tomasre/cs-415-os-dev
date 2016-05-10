'use strict';
(function(){
    os.bin.remove = remove;
    var workingDirectory = os._internals.fs.disk.root;
    os.ps.register('remove', remove, {stdout:true});

    function remove(options, argv){
        var onFailMsg ="The file " + argv[0] + " does not exist";
        var onSuccessMsg = "The file " + argv[0] + "has been removed";
        var stdout = options.stdout;

        var target = parsePath(argv[0]);

        if(workingDirectory[target]) {
            delete workingDirectory[target];
            console.log(onSuccessMsg);
        } else {
            console.log(onFailMsg);
            stdout.appendToBuffer(onFailMsg);
        }
    }


    function parsePath(path) {
        //splits absolute path provided to the function by pash
        var splitPath = path.split('/');
        console.log(splitPath);
        //insures the working directory starts at root
        workingDirectory = os._internals.fs.disk.root;
        // removes root from the path
        splitPath.shift();
        //removes destinations from the path
        var newFileName = splitPath.pop();
        console.log(splitPath);

        if (splitPath.length > 0){
            for( var i = 0; i< splitPath.length; i++) {
                var temp;
                temp = workingDirectory[splitPath[i]];
                workingDirectory = temp;
            }
        }
        //returns name of the file you want to create
        return newFileName;
    }

})();