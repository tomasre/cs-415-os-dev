/**
 * Created by euphoric on 4/30/16.
 */
(function () {
    'use strict';
    os.ps.register('mkDir', mkDir, {stdout: true});
    
    function mkDir(options, argv) {

        var stdout = options.stdout;
        var dirPath = argv;
        
        os.fs.create(dirPath, function (errCreate, newDirectory) {
            if(errCreate === -1) {
                stdout.appendToBuffer("Error Creating Directory");
            } else {
                console.log("Sucess calling Create in mkDir");
            }
        })
        
        
        
        
    }
    
    



})();