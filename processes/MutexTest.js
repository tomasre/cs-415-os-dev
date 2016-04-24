'use strict';

(function () {
    os.ps.register('MutexTest', main, {stdout: true});

    var stdout;

    function main(options, argv) {

        stdout = options.stdout;
console.log('mutex');
        stdout.appendToBuffer('Createing 10 Threads\n');

        // create 10 threads to test
        for (var i = 0; i < 10; i++) {
            os.ps.createThread(threadRunContext, allThreadsFinished);
        }



    }

    function threadRunContext() {
        // DONT ACCESS INTERNALS JUST FOR TEST
        var process = os._internals.ps.runningProcess.slice(0);
        stdout.appendToBuffer(process + ' Running in separate context');

        os.ps.pthread_mutex_lock('MutexLockTest', function (lockedData) {

            if (lockedData.dumb) {
                stdout.appendToBuffer( process + ': lockedData.dumb already exists, incrementing by 5');
                lockedData.dumb += 5;
                stdout.appendToBuffer(process + ': lockedData.dumb: ' + lockedData.dumb);
            } else {
                stdout.appendToBuffer(process + ': lockedData.dumb doesnt exist creating it = 5');
                lockedData.dumb = 5;
                stdout.appendToBuffer(process + ': lockedData.dumb: ' + lockedData.dumb);
            }

            // now unlock
            os.ps.pthread_mutex_unlock('MutexLockTest', function () {
                stdout.appendToBuffer(process + ' done running in separate context');
            });

        });
    }

    function allThreadsFinished(threadName) {
        stdout.appendToBuffer('All threads for ThreadTest Finished --> last thread' + threadName);
    }
})();
