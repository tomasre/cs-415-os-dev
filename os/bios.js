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
                fs: 0,
                inputDriver: 0
            },
            // maps to the above waits
            asyncOperationTypes: {
                FS: 'fs',
                KEYBOARD_DRIVER: 'inputDriver'
            }
        },
        stream: {},
        drivers: {}
    }
};