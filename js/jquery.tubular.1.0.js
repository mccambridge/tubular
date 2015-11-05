/* jQuery tubular plugin
|* by Antoine Bisch superseeded on Sean McCambridge
|* http://jahDsign.com
|* version: 2.0
|* updated: October 1, 2014
|* since 2010
|* licensed under the MIT License */

(function ($, window) {

    // defaults
    var defaults = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        videoId: 'ZCAnLxRvNNc', // toy robot in space is a good default, no?
        mute: true,
        repeat: true,
        width: $(window).width(),
        wrapperZIndex: 99,
        playButtonClass: 'tubular-play',
        pauseButtonClass: 'tubular-pause',
        muteButtonClass: 'tubular-mute',
        mutedButtonClass: 'tubular-muted',
        volumeUpClass: 'tubular-volume-up',
        volumeDownClass: 'tubular-volume-down',
        switchClass: 'tubular-switch',
        increaseVolumeBy: 10,
        start: 0,
        end: false,
        videoQuality: 'hd1080',
        relatedVideos: 0
    };

    // methods
    var tubular = function(node, options) { // should be called on the wrapper div
        var $window = $(window), //cache window
            $body = $('body'), // cache body node
            $node = $(node), // cache wrapper node
            $tubularPlayer;
        options = $.extend({}, defaults, options);

        // build container
        var tubularContainer = '<div id="tubular-container" style="overflow: hidden; position: fixed; z-index: 1; width: 100%; height: 100%"><div id="tubular-player" style="position: absolute"></div></div><div id="tubular-shield" style="width: 100%; height: 100%; z-index: 2; position: absolute; left: 0; top: 0;"></div>';

        // set up css prereq's, inject tubular container and set up wrapper defaults
        $('html,body').css({'width': '100%', 'height': '100%'});
        $body.prepend(tubularContainer);
        $node.css({position: 'relative', 'z-index': options.wrapperZIndex});

        // set up iframe player, use global scope so YT api can talk
        window.onYouTubeIframeAPIReady = function() {
            window.player = new YT.Player('tubular-player', {
                width: options.width,
                height: Math.ceil(options.width / options.ratio),
                videoId: options.videoId,
                playerVars: {
                    controls: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    wmode: 'transparent',
                    vq: options.videoQuality,
                    rel: options.relatedVideos,
                    end: options.end
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };

        window.onPlayerReady = function(e) {
            $tubularPlayer = $('#tubular-player');
            resize();
            if (options.mute) e.target.mute();
            e.target.seekTo(options.start);
            e.target.playVideo();
        };

        window.onPlayerStateChange = function(state) {
            if (state.data === 0 && options.repeat) { // video ended and repeat option is set true
                player.seekTo(options.start); // restart
            }
        };

        // resize handler updates width, height and offset of player after resize/init
        var resize = function() {
            var width = $window.width(),
                pWidth, // player width, to be defined
                height = $window.height(),
                pHeight; // player height, tbd

            // when screen aspect ratio differs from video, video must center and underlay one dimension

            if (width / options.ratio < height) { // if new video height < window height (gap underneath)
                pWidth = Math.ceil(height * options.ratio); // get new player width
                $tubularPlayer.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0}); // player width is greater, offset left; reset top
            } else { // new video width < window width (gap to right)
                pHeight = Math.ceil(width / options.ratio); // get new player height
                $tubularPlayer.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2}); // player height is greater, offset top; reset left
            }
        };

        // events
        $window.on('resize.tubular', function() {resize();});
        $body.on('click','.' + options.playButtonClass, function(e) { // play button
            player.playVideo();
            e.preventDefault();
        })
        .on('click', '.' + options.pauseButtonClass, function(e) { // pause button
            player.pauseVideo();
            e.preventDefault();
        })
        .on('click', '.' + options.muteButtonClass, function(e) { // mute button
            if (player.isMuted()) {
                player.unMute();
                $(this).removeClass(options.mutedButtonClass);
            }
            else {
                player.mute();
                $(this).addClass(options.mutedButtonClass);
            }
            e.preventDefault();
        })
        .on('click', '.' + options.volumeDownClass, function(e) { // volume down button
            var currentVolume = player.getVolume();
            if (currentVolume >= options.increaseVolumeBy) {
                player.setVolume(currentVolume - options.increaseVolumeBy);
            }
            e.preventDefault();
        })
        .on('click', '.' + options.volumeUpClass, function(e) { // volume up button
            if (player.isMuted()) player.unMute(); // if mute is on, unmute
            var currentVolume = player.getVolume();
            if (currentVolume <= 100) {
                player.setVolume(currentVolume + options.increaseVolumeBy);
            }
            e.preventDefault();
        })
        .on('click', '.' + options.switchClass, function(e) { // switch button
            player.loadVideoById($(this).data('id'));
            e.preventDefault();
        })
    };

    // load yt iframe js api
    var tag = document.createElement('script'),
        firstScriptTag = document.getElementsByTagName('script')[0];
    tag.src = '//www.youtube.com/iframe_api';
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // create plugin
    $.fn.tubular = function (options) {
        return this.each(function () {
            if (!$.data(this, 'tubular_instantiated')) { // let's only run one
                $.data(this, 'tubular_instantiated', 
                tubular(this, options));
            }
        });
    };

})(jQuery, window);
