'use strict';
/*
CONDITIONALLY CREATING RIGHT NOW IF DOES NOT EXIST
 */
(function(){

    var MAX_WRITE_SIZE = 100;
    os.fs.write = writeFile;
    var workingDirectory = os._internals.fs.disk.root;

   function writeFile(fileName,data,position,cb){
       var temp = fileName;
        var psname = os._internals.ps.runningProcess.slice(0);
       console.log("Path inside Wrapper: " + fileName);
        var writeTarget = parsePath(fileName);
		// For file update

       console.log("write target inside Wrapper: " + writeTarget);
       console.log("Working Directory Inside Wrapper: ");

       console.log(workingDirectory);
       console.log("Write Position: " + position);

       console.log("Data Passed To Wrapper: " + data);



		if(position === 0){
			workingDirectory[writeTarget].data = '';
		}
        os._internals.fs.operationQueue.push({
            operation: function () {
                setTimeout(function () {
                    performWriteFile(psname, temp, data, cb);
                }, generateRandomTimeout());
            },
            // copy string
            processName: psname
        });
    }

    function performWriteFile(psname, path, dataPar, cb){
        var entrypoint;
        console.log("path handed to perform write: " + path);
        var writeTarget = parsePath(path);

        var fileString = workingDirectory[writeTarget].data;

        if(fileExists(writeTarget)){
            console.log("Write Target: " + writeTarget);
            console.log("Data before write " + workingDirectory[writeTarget].data);
            workingDirectory[writeTarget].data = fileString + dataPar;
            console.log("Data Parameter: " + dataPar);
            console.log("Data after write: " + workingDirectory[writeTarget].data);
            entrypoint = function(){
                cb(0,path)
            }
        } else {
            entrypoint = function() {
                cb(-1);
            }
        }
        os._internals.ps.fsOperationReadyToReturn(psname,entrypoint);
    }

    function generateRandomTimeout() {
        return Math.floor(Math.random() * (100 - 10) + 10);
    }

    function withinMaxSize(dataLength){
        if(dataLength <= MAX_WRITE_SIZE ){
            return true;
        } else {
            return false;
        }
    }

    function fileExists(name){
        if(typeof workingDirectory[name] === "undefined") {
            return false;
        } else {
            return true;
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
