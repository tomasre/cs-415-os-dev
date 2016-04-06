'use strict';
(function () {
    os._internals.ps.exec = initProcess;
    
    function initProcess(name, cb) {
        // Takes care of possible duplicate IDs in the pcb queue
        var max_id = -1;
        var avaliable_ps = 0;
        for (var i = 0; i < os._internals.ps.pcb.length; i++) {
            if (os._internals.ps.pcb[i].id > max_id)
                max_id = os._internals.ps.pcb[i].id;
            if (os._internals.ps.pcb[i].state === os._internals.ps.states.stop)
                available_ps = i;
        }

        os._internals.ps.pcb[i]({
            id: max_id + 1,
            name: name,
            state: os._internals.ps.states.START,
            entryPoint: cb
        });
    }
})();