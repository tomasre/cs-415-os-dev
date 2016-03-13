'use strict';

var os = {
    fs: {},
    ps: {},
    _internals: {
        fs: {
            disk:{},
            operationQueue: []
        },
        ps: {
            pcb: [],
            states: {
                START: 'START',
                STOP: 'STOP',
                WAITING: 'WAITING',
                READY: 'READY',
                RUNNING: 'RUNNING'
            },
            runningProcess: '',
            waits: {
                fs: 0
            }
        },
        stream: {},
        drivers: {}
    }
};