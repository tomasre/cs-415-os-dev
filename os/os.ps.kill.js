'use strict';
(function () {
    os._internals.ps.kill = killProcess;
    
    function killProcess(pname) {
        pname = pname.toLowerCase();
        var i = 0;
        while (i < os._internals.ps.pcb.length 
            && os._internals.ps.pcb[i].name.toLowerCase() === pname) 
            i++;
        if (i === os._internals.ps.pcb.length) 
            return { status: -1 };
        
        // Stop the process & return the stopped process if found
        os._internals.ps.pcb[i].state = os._internals.ps.states.STOP;
        var removedProcess = os._internals.ps.pcb[i];
        removedProcess["status"] = 0;
        return removedProcess;
    }
})();