/**
 * Created by euphoric on 3/8/16.
 */
"use strict";

(function(){

    os._internals.drivers.keyboard = {
        attachStream: attachStream
    };

    var attachedStream;

    /*
     registers a listener function
     listener is a function which is called with one argument: a string
     injestKey is the key which is pressed and determines when to update the stream
     two available options are 'any' and 'enter'
     */
    function attachStream(stream) {
        attachedStream = stream;
    }

    var input = document.querySelector('input');


    input.addEventListener("keydown",function(e) {
        var charCode;


        if (e && e.which) {
            charCode = e.which;
        } else if (window.event) {
            e = window.event;
            charCode = e.keyCode;
        }
        if (charCode == 13) {
            console.log("success " + input.value);
            attachedStream.appendToBuffer(input.value);
            document.getElementById('cL').value = "";
            e.preventDefault();
        }
    });

    input.addEventListener('input',function() {
        console.log('input changed to ', input.value);
    });
})();
