'use strict';

(function() {
    os.ps.register('DiningPhilosophers', main, {
        stdout: true
    });

    var stdout;

    function main(options, argv) {

        stdout = options.stdout;
        stdout.appendToBuffer('About to philosophize... if no done statement - means they reached deadlock');

        /*
        5 philosophers trying to dine
        5 forks
        philosophers: 0 1 2 3 4 <-- i
        forks     :[4] 0 1 2 3 4  <-- which one is inbetween
        each philosopher (thread) tries to lock i - 1 and then i for left and right forks
        */
        for (var i = 0; i < 5; i++) {
            // closure on i to capture for async
            (function(i) {
                os.ps.createThread(
                    function philosopher() {

                        // wrap around table if its the first philosopher
                        var leftFork = (i === 0) ? 4 : i - 1;
                        var leftForkLockName = 'fork-' + leftFork;

                        var rightFork = i;
                        var rightForkLockName = 'fork-' + rightFork;
                        stdout.appendToBuffer('Philosopher #:' + i + ' created');


                        // acquire a lock on left fork
                        os.ps.pthread_mutex_lock(leftForkLockName, function(lockedData) {

                            stdout.appendToBuffer('Philosopher #:' + i + ' picked UP LEFT fork: ' + leftForkLockName + ', thinking...');
                            // to guarantee an infinite standstill (wait) between picking up left and right fork

                            os.fs.length('vector_data.csv', function (errorLength, length) {

                                if (errorLength === -1) {
                                    stdout.appendToBuffer('DiningPhilosophers: error getting file length:');
                                }

                                stdout.appendToBuffer('Philosopher #:' + i + ' waiting to pick up ' + rightForkLockName);

                                // dont actually care about the length - do nothing on error

                                os.ps.pthread_mutex_lock(rightForkLockName, function(lockedData) {

                                    stdout.appendToBuffer('Philosopher #:' + i + ' picked up RIGHT fork: ' + rightForkLockName);
                                    stdout.appendToBuffer('Philosopher #:' + i + ' eating...');

                                    // now unlock
                                    os.ps.pthread_mutex_unlock(leftForkLockName, function() {

                                        stdout.appendToBuffer('Philosopher #:' + i + ' put DOWN LEFT fork: ' + leftForkLockName);

                                        os.ps.pthread_mutex_unlock(leftForkLockName, function() {

                                            stdout.appendToBuffer('Philosopher #:' + i + ' put DOWN RIGHT fork: ' + rightForkLockName);
                                            stdout.appendToBuffer('Philosopher #:' + i + ' finished eating...');

                                        });
                                    });
                                });
                            });
                        });

                    }, allThreadsFinished);
            })(i)
        }
    }

    function allThreadsFinished(threadName) {
        stdout.appendToBuffer('Philosophers DONE eating ' + threadName);
    }
})();
