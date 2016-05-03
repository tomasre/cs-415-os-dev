/**
 * Created by euphoric on 5/3/16.
 */
(function () {
    var songs = ["1. Juicy", "2. NotoriousThugz", "3. WhoShotYa"];
    var juicy;
    var thugz;
    var whoShotYa;

    var userMan = "exec audio [song source]";
    var stdout;

    os.ps.register('Audio_Player', Audio_Player, {stdout:true, stdin: Audio_Listener}, userMan);

    function Audio_Player (options, argv) {
        stdout = options.stdout;
        stdout.appendToBuffer('Preparing ' + argv[0]);

        stdout.appendToBuffer("Pick A Song To Play!");
        for( var i = 0; i<songs.length; i++) {
            stdout.appendToBuffer(songs[i]);
        }
        stdout.appendToBuffer('Type Play or Pause followed by the [song Name]');

        var thread1 = os.ps.createThread(function(){
            juicy = new Sound("AudioSamples/Juicy.mp3");
        }, allThreadsFinished);

        var thread2 = os.ps.createThread(function(){
            thugz = new Sound("AudioSamples/Thugz.mp3");
        }, allThreadsFinished);

        var thread3 = os.ps.createThread(function(){
            whoShotYa = new Sound("AudioSamples/WhoShotYa.mp3");
        }, allThreadsFinished);




    }

    function Audio_Listener(stream) {
        var buf = stream.consumeBuffer();
        var command = buf.replace("dummy@OS $ ", "").split(' ');

        switch(command[0]){
            case 'play':
                if(command[1]==='Juicy'){
                    juicy.play()
                } else if(command[1]=== 'NotoriousThugz'){
                    thugz.play();
                } else if(command[1]=== 'WhoShotYa'){
                    whoShotYa.play();
                } else {
                    stdout.appendToBuffer('Song Not Found');
                }
                break;
            case 'pause':
                if(command[1]==='Juicy'){
                    juicy.stop()
                } else if(command[1]=== 'NotoriousThugz'){
                    thugz.stop();
                } else if(command[1]=== 'WhoShotYa'){
                    whoShotYa.stop();
                } else {
                    stdout.appendToBuffer('Song Not Found');
                }
                break;
            case 'exit' :
                os._internals.drivers.keyboard.deregisterStream();
                break

        }

    }

    //gangsta as fuuuuuuuuu

    function Sound(src){
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload","auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        };
        this.stop = function() {
            this.sound.pause();
        };
    }

    function  allThreadsFinished(threadname) {
        stdout.appendToBuffer("Pick A Song To Play!");
        for( var i = 0; i<songs.length; i++) {
            stdout.appendToBuffer(songs[i]);
        }
        stdout.appendToBuffer('Type Play [song Name]');
    }






})();