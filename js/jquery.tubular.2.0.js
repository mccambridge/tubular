/* jQuery tubular plugin
|* by Sean McCambridge
|* http://www.seanmccambridge.com/tubular
|* version: 2.0
|* updated: September, 2013 by Julian Xhokaxhiu
|* since 2010
|* licensed under the MIT License
|* Enjoy.
|*
|* Thanks,
|* Sean */

;(function ($, window) {

    // test for feature support and return if failure

    // defaults
    var defaults = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        videoId: 'ZCAnLxRvNNc', // toy robot in space is a good default, no?
        mute: true,
        repeat: true,
        width: $(window).width(),
        wrapperZIndex: 99,
        start: 0
    };

    // methods

    var tubular = function(node, options) { // should be called on the wrapper div
        var $body = $(node).parent(), // cache body node
            $node = $(node), // cache wrapper node
            playerContainerId = 'tubularPlayer-' + $node.attr('id');

        if(typeof options == 'string'){
            var player = $node.data('tubularPlayer');
            try{
	            switch(options){
	                case 'play':{
	                    player.playVideo();
	                    break;
	                };
	                case 'pause':{
	                    player.pauseVideo();
	                    break;
	                };
	                case 'stop':{
	                    player.stopVideo();
	                    break;
	                };
	                default:;
	            }
	        }catch(e){
	        	// Silently do nothing...
	        }
        }else{
            var options = $.extend({}, defaults, options);

            // build container
            var tubularContainer = $('<div>',{
                'id': 'tubularContainer-' + $node.attr('id')
            }).css({
                'position': 'absolute',
                'z-index': 1,
                'width': '100%',
                'height': '100%'
            }).append(
                $('<div>',{
                    'id': playerContainerId
                }).css({
                    'position': 'absolute'
                })
            );

            var embedPlayer = function() {
                console.log(options);
                $node.data('tubularPlayer',
                	new YT.Player(playerContainerId, {
	                    width: options.width,
	                    height: Math.ceil(options.width / options.ratio),
	                    videoId: options.videoId,
	                    playerVars: {
	                        controls: 0,
	                        showinfo: 0,
	                        modestbranding: 1,
	                        wmode: 'transparent'
	                    },
	                    events: {
	                        'onReady': function(e) {
	                            resize();
	                            if (options.mute) e.target.mute();
	                            e.target.seekTo(options.start);
	                            e.target.playVideo();
	                        },
	                        'onStateChange': function(state) {
	                            if (state.data === 0 && options.repeat) { // video ended and repeat option is set true
	                                $node.data('tubularPlayer').seekTo(options.start); // restart
	                            }
	                        },
	                        'onError': function(e){
	                            tubularContainer.hide();
	                        }
	                    }
	                })
				);
            }

            // resize handler updates width, height and offset of player after resize/init
            var resize = function() {
                var width = tubularContainer.width(),
                    pWidth, // player width, to be defined
    				height = tubularContainer.height(),
                    pHeight, // player height, tbd
                    $tubularPlayer = $('#'+playerContainerId);

                // when screen aspect ratio differs from video, video must center and underlay one dimension

                if (width / options.ratio < height) { // if new video height < window height (gap underneath)
                    pWidth = Math.ceil(height * options.ratio); // get new player width
                    $tubularPlayer.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0}); // player width is greater, offset left; reset top
                } else { // new video width < window width (gap to right)
                    pHeight = Math.ceil(width / options.ratio); // get new player height
                    $tubularPlayer.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2}); // player height is greater, offset top; reset left
                }

            }

            // If the API is already loaded, embed the player
            if(window.YT) embedPlayer();
            else{
	            // load multiple videos at once
	            $node.addClass('initTubular').data('initTubular', function(){
	                embedPlayer();
	            });
	            if(!window.onYouTubeIframeAPIReady){
	            	window.onYouTubeIframeAPIReady = function(){
		                $('body .initTubular').each(function(i,el){
		                    $(el).data('initTubular')();
		                })
	            	};
	            	// load yt iframe js api
                    $('body').append(
                        $('<script>',{
                            'src': '//www.youtube.com/iframe_api'
                        })
                    );
	            }
			}

            // set up css prereq's, inject tubular container and set up wrapper defaults
            $body.prepend(tubularContainer);
            tubularContainer.after(
                $('<div>').css({
                    'width': '100%',
                    'height': '100%',
                    'z-index': 2,
                    'position': 'absolute',
                    'left': 0,
                    'top': 0
                })
            );
            $node.css({
                'position': 'relative',
                'z-index': options.wrapperZIndex
            });

            // events
            $(window).on('resize.tubular', function() {
                resize();
            })
        }
    }

    // create plugin

    $.fn.tubular = function (options) {
        return this.each(function () {
            if (!$.data(this, 'tubular_instantiated')) { // let's only run one
                $.data(this, 'tubular_instantiated',
                tubular(this, options));
            }
        });
    }

})(jQuery, window);