'use strict';
(function () {
    os._internals.ps.ps = listProcess;
    
    function listProcess () {
        // TODO: Find out how we'll be printing to console
        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            var process = os._internals.ps.pcb[i];
            /* Sample ps output
             *     PID TTY           TIME CMD
             *    1403 ttys000    0:00.20 -bash
             */
        }
    }
})();