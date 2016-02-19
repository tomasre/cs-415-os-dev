'use strict';

var os = {
    fs: {},
    ps: {},
    _internals: {
        fs: {
            disk:{}
        },
        ps: {
            pcb: []
        }
    }
};