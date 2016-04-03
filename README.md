# cs415-assignment-1
dummy operating system for 415   

To run the code online visit: [cs-415-os-dev](http://tomassre.github.io/cs-415-os-dev/)    

Note this repo is the development version of this project.  For each of the assignments   
that we will actually turn in they will have their own branch.   

## process guidelines   
'use strict'; as your first line of code   

wrap your entire function in a closure:   
 ```
(function () {   

    // your code goes here      

})();   
```

## naming conventions    
'processes' are named as the name of the process.   

os files are named based on their structure for example:   
os.fs.read.js   
os.fs.write.js   
os.ps.registerProcess.js   

## os data structures   
os._internals is used to store the filesystem and process data   
should not be accessed outside the os files   

## fs internals   
note: the data is stored on the simulated disk located in:      
os._internals.fs.disk     
note: each 'file' is a property on this disk     
refer to [os.fs.disk.js](os/os.fs.disk.js) for example data format     
Each of these file objects they contain a 'data' parameter which contains the actual disk data     
They also contain a 'meta' parameter which will be the file handles.     
We assume a file can be open by only one process at a time.     
'meta' is an object with the *required* parameters of 'pos' and 'name' .     
os.fs.open returns a 'filehandle' with some data about the file (one of these being the position 'pos')      
Note: when returning the filehandle to the calling processes, you should *NOT* return this exact object      
doing so could allow them to move the position (fs op) without going through the fs    
os.fs.open should just return a dummy filehandle with the required data    
