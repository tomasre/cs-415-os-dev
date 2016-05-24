/*
 * StatsCalc - Author:Darrel Daquigan
 * 
 * This process uses threads and semaphores to read in a file of integers
 * and outputs a new file of statistical information
 *
*/
'use strict';

(function () {

    var userMan = "[sourceFile] (optional) [destinationFile]\n" +
        "try exec StatsCalc integers.csv";
    os.bin.StatsCalc = StatsCalc;
    os.ps.register('StatsCalc', StatsCalc, {stdout: true},userMan);

    function StatsCalc(options, argv) {
        var stdout = options.stdout;

        var inputFile = argv[0];

        async.waterfall([
            //get input file length
            function (callback) {
                os.fs.length(inputFile, function (errorLength, length) {
                    if (errorLength === -1){
                        console.log('Stats data: error getting file length: ' +
                            os.errno.errorCode + '\n');
                        callback('Error');
                    }
                    else 
                        callback(null, length);
                });
            },

            //open input file
            function (length, callback){
                os.fs.open(inputFile, function (errorOpen, fh){
                    if (errorOpen === -1) {
                        console.log(inputFile + ': error opening file:' +
                            errorOpen + '\n');
                        callback(errorOpen);
                    } else {
                        var openMsg = "Opening " + fh.name + " size: " + length;
                        stdout.appendToBuffer(openMsg);
                        callback(null, length, fh);
                    }
                });
            },

            // read input file
            function (length, fh, waterfallCallBack) {
                var CHARS_TO_READ = 100;
                var currentPosition = 0;
                var fullFile = '';

                function checkCompleted() {
                    if (currentPosition >= length) 
                        waterfallCallBack( null, fullFile, fh);
                    else
                        readNextBlock();
                }
                function readNextBlock() {
                    var charCount = currentPosition + CHARS_TO_READ > length ?
                        length - currentPosition : CHARS_TO_READ;

                    os.fs.read(fh, charCount, function (errorRead, data) {
                        if (errorRead === -1){
                            console.log(inputFile + ": error reading file: \n");
                            waterfallCallBack ('Error Read');
                        } else {
                            fullFile += data;

                            os.fs.seek(fh, charCount, function (errorSeek) {
                                if (errorSeek === -1) {
                                    console.log(inputFile + ": error seeking file:\n");
                                    waterfallCallBack('Error Seek');
                                } else {
                                    currentPosition += charCount;
                                    checkCompleted();
                                }
                            });
                        }
                    });
                }
                checkCompleted();
            },

            
            //calculate mean
            function (fullData, fh, callback) {
                //console.log("start mean block, fullData: " + fullData);
                var samplesString = fullData.split(',');
                var samplesInt = []
                for (var i = 0; i < samplesString.length; i++){
                    samplesInt[i] = Number(samplesString[i]);
                }
                var stats = {
                    samples: samplesInt,
                    n: samplesInt.length,
                    sum: 0,
                    mean: 0,
                    stdDev: 0,
                    diffSumm: 0,
                    range: Math.ceil(samplesInt.length/5),
                    print: function(){
                        console.log("sum: " + this.sum + ", n: " + this.n + ", mean: " + this.mean + ", diffSumm: " + this.diffSumm + ", stdDev: " + this.stdDev + ", range: " + this.range );
                    }
                };
                var threadsDoneCalc = 0;
                for (var i = 0; i < 5; i++){
                    (function(i) {
                        os.ps.createThread(
                            function (){
                                console.log("thread " + i + " created");
                                os.ps.pthread_semaphore_lock(
                                    'meanLock',
                                    function (){
                                        console.log("thread " + i + " lock");
                                        
                                        for (var j = 0; j < stats.range; j++){
                                            if (i < 4 || j < stats.n%stats.range){
                                                //console.log("counting pos " + ((i*stats.range)+j) + ": " + stats.samples[(i*stats.range)+j]);
                                                stats.sum += stats.samples[(i*stats.range)+j];
                                            }
                                        }

                                        threadsDoneCalc++;

                                        os.ps.pthread_semaphore_unlock(
                                            'meanLock',
                                            function(){

                                                console.log("Thread " + i + " unlock");
                                                stats.mean = stats.sum/stats.n;
                                                stats.print();
                                                callback(null, stats, threadsDoneCalc, fh);
                                            }
                                        );
                                    }
                                );
                            },
                            threadsDone
                        );
                    })(i)
                }
            },

            //calculate standard deviation
            function (stats, count, fh, callback) {
                console.log("start stddev block")
                if(count == 5){
                    var ThreadsDoneCalc = 0;
                    console.log("all threads done calculating mean");
                    for (var i = 0; i < 5; i++){
                        (function(i){
                            os.ps.createThread(
                                function(){
                                    console.log("bThread " + i + " created");
                                    os.ps.pthread_semaphore_lock(
                                        'stdDevLock',
                                        function(){
                                            console.log("bThread " + i + " lock");
                                            for (var j = 0; j < stats.range; j++){
                                                if (i < 4 || j < stats.n%stats.range){
                                                    //console.log("STDcounting pos " + ((i*stats.range)+j) + ": " + stats.samples[(i*stats.range)+j]);

                                                    stats.diffSumm += Math.pow((stats.samples[(i*stats.range) + j] - stats.mean),2);
                                                }
                                            }
                                            ThreadsDoneCalc++;
                                            console.log("Check " + ThreadsDoneCalc);
                                            os.ps.pthread_semaphore_unlock(
                                                'stdDevLock',
                                                function(){
                                                    console.log("Thread " + i + " unlock");
                                                    stats.stdDev = Math.sqrt(stats.diffSumm/(stats.n));
                                                    stats.print();
                                                    callback(null,stats,ThreadsDoneCalc,fh);
                                                }
                                            );
                                        }
                                    );
                                },
                                threadsDone
                            );    
                        })(i)
                    }
                }
                else{
                    console.log("Waiting on " + (5 - count) + " threads");
                }
            },


            

            //open output file
            function (stats, count, fh, callback) {
                console.log("start output block");
                if (count == 5){
                    console.log("all threads done calculating stdDev");   
                    var result = "Statistics for " + fh.name + ":\n" +
                        "mean: " + stats.mean + "\n" +
                        "standard deviation: " + stats.stdDev + "\n" +
                        "sample size: " + stats.n;
                    var defaulDestination = "newStatsData.csv";

                    var outputFile; 

                    
                    if(argv.length === 2)
                        outputFile = argv[1];
                    else outputFile = defaulDestination;
                    

                    stdout.appendToBuffer("Exporting Stats data to " + outputFile);

                    async.waterfall([
                        //create output file
                        function (callback) {
                            os.fs.create(outputFile, function (errCreate, newFile){
                                if (errCreate === -1) {
                                    console.log("error on create");
                                    callback("Error");
                                } else {
                                    console.log('Success -------- new file created: ' + 
                                        newFile + os._internals.fs.disk);
                                    callback(null, newFile);
                                }
                            });
                        },

                        //write to output file
                        function (writeTarget, recursivecallback) {
                            var fullResult = result;
                            var buffer = '';
                            var CHARS_TO_WRITE = 5;
                            var writeSize = result.length;
                            var fileName;
                            var writePosition = 0;

                            function writeCompleted() {
                                if (writePosition >= writeSize) 
                                     recursivecallback(null, writeTarget, fileName);
                                else
                                    writeNextBlock();
                            }

                            function writeNextBlock(){
                                var writeEnd;
                                if (writePosition + CHARS_TO_WRITE < writeSize)
                                    writeEnd = writePosition  + CHARS_TO_WRITE;
                                else 
                                    writeEnd = writeSize;
                                buffer = fullResult.substring(writePosition,writeEnd);

                                os.fs.write(writeTarget, buffer, writePosition, function (error, fileName) {
                                    if (error === -1){
                                        console.log(fileName + ': error writing' + error + '\n');
                                        callback('Error');
                                    } else {
                                        console.log("Write at Position: " + writePosition);
                                        writePosition = writePosition + CHARS_TO_WRITE;
                                        writeCompleted();
                                    }
                                });
                            }
                            writeCompleted();
                        },

                        //close input file
                        function (writeTarget,fileName,callback){
                            os.fs.close(inputFile, function (errClose, msg){
                                if (errClose === -1)
                                    console.log(msg);
                                else
                                    callback(null);
                            });
                        }
                    ],

                    function (err, writeResult) {
                        if (err === -1) 
                            console.log('Write Async Block failure');
                        else 
                            console.log('Write Async Block Success');
                    });
                }
                else {
                    console.log("Waiting on " + (5 - count) + " threads");
                }
            }
        ],

        function (error, result) {
            if (error === -1) 
                console.log('StatsCalc: ERROR in execution. exited early');
            else {
                stdout.appendToBuffer("Finished");
                console.log('StatsCalc Done');
            }
        });
    } 

    function threadsDone(){
        console.log("Thread done");
    }

})();
