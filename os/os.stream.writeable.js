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
        appends str to the buffer
        if there is a registered driver, driverUpdate will be called
         */
        this.appendToBuffer = function (str) {
            this._buffer += str;
            if (this._driverUpdate) {
                this._driverUpdate(this);
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