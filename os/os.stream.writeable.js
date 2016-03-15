'use strict';

(function () {
    os._internals.stream.writeable = writeable;

    function writeable() {

        /*
        internal member - not to be accessed directly
         */
        this._buffer = '';

        /*
        internal member - not to be accessed directly
         */
        this._driverUpdate = null;

        /*
        internal member - not to be accessed directly
         */
        this._streamListener = null;

        /*
        internal member - not to be accessed directly
         */
        this._streamListenerProcessName = '';

        /*
        If the other end of the stream is to be held by a driver process
        (display device or input device)
        This will register it to be able to update synchronously
        driverUpdate is a function which takes in one parameter:
        a writeable stream
        ex: driverUpdate(this);
        NOTE: driverUpdate function must operate synchronously
         */
        this.registerDriver = function (driverUpdate) {
            this._driverUpdate = driverUpdate;
        };

        /*
        A process can register a listener with a stream
        this listener is a function which is called with one argument, a string
        this is the input to a stream
         */
        this.registerStreamListener = function (listener, processName) {
            this._streamListener = listener;
            this._streamListenerProcessName = processName;
        };

        /*
        appends str to the buffer
        if there is a registered driver, driverUpdate will be called
        if there is a registerStreamListener, it will be called
         */
        this.appendToBuffer = function (str) {
            this._buffer += str;

            // update the display driver if one is attached
            if (this._driverUpdate) {
                this._driverUpdate(this);
            }

            // tell the scheduler to schedule our process if it is ready
            if (this._streamListener) {
                os._internals.ps.fsOperationReadyToReturn(this._streamListenerProcessName, function () {
                    this._streamListener(this);
                });
            }
        };

        /*
        returns a copy of the data in buffer - without clearing data
         */
        this.readBuffer = function () {

            return this._buffer ? this._buffer.slice(0) : '';
        };

        /*
        returns the data in the buffer and also clears it
         */
        this.consumeBuffer = function () {

            var buf = this._buffer ? this._buffer.slice(0) : '';
            this._buffer = '';
            return buf;
        };

        /*
        clears the internal buffer
         */
        this.wipeBuffer = function () {
            this._buffer = '';
        };

        /*
        returns the length of the internal buffer
         */
        this.getBufferLength = function () {
            return this._buffer ? this._buffer.length : 0;
        };
    }
})();
