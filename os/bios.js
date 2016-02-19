'use strict';

var os = {
    fs: {},
    ps: {},
    _internals: {
        fs: {
            disk:{}
        },
        ps: {
            pcb: [],
            states: {
                START: 1,
                STOP: 2,
                WAITING: 3,
                READY: 4,
                RUNNING: 5
            }
        }
    }
};