'use strict';

(function () {
    os.ps.register('ThreadTest', main, {stdout: true});

    var stdout;

    function main(options, argv) {

        stdout = options.stdout;
        stdout.appendToBuffer('Createing 4 Threads\n');

        var thread1 = os.ps.createThread(function () {
            stdout.appendToBuffer('Thread1 Running in separate context');
        }, allThreadsFinished);

        stdout.appendToBuffer('Just created thread: ' + thread1);

        var thread2 = os.ps.createThread(function () {
            stdout.appendToBuffer('Thread2 Running in separate context');
        }, allThreadsFinished);

        stdout.appendToBuffer('Just created thread: ' + thread2);

        var thread3 = os.ps.createThread(function () {
            stdout.appendToBuffer('Thread3 Running in separate context');
        }, allThreadsFinished);

        stdout.appendToBuffer('Just created thread: ' + thread3);

        var thread4 = os.ps.createThread(function () {
            stdout.appendToBuffer('Thread4 Running in separate context');
        }, allThreadsFinished);

        stdout.appendToBuffer('Just created thread: ' + thread4);
    }

    function allThreadsFinished(threadName) {
        stdout.appendToBuffer('All threads for ThreadTest Finished --> last thread' + threadName);
    }
})();
