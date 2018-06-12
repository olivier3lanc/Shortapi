var shortapi = {
    /**
    * Simply returns the current FOV
    * @return number
    */
    getFov: function(){
        return viewer.camera.fov;
    },
    /**
    * Simply returns the current YAW
    * @return number
    */
    getYaw: function(){
        return viewer.camera.yaw;
    },
    /**
    * Simply returns the current PITCH
    * @return number
    */
    getPitch: function(){
        return viewer.camera.pitch;
    },
    /**
    * Simply returns the current scene UID
    * @return string
    */
    getCurrentSceneUid: function(){
        return viewer.story.sceneUid;
    },
    /**
    * Simply returns the current scene view type (projection)
    * @return string
    */
    getProjection: function(){
        return viewer.view.type;
    },
    /**
    * Simply returns an object with hotspots on the current scene
    * @return object
    */
    getHotspots: function(){
        var currentSceneUid = this.getCurrentSceneUid();
        return FORGE.UID.get(currentSceneUid).config.hotspots;
    },
    /**
    * Simply returns the UID of the next scene
    * @return string if elligible
    * @return boolean false if specified UID is the last scene
    */
    getNextSceneUid: function(){
        return this.getPreviousNextUid().nextSceneUid;
    },
    /**
    * Simply returns the UID of the previous scene
    * @return string if elligible
    * @return boolean false if specified UID is the first scene
    */
    getPreviousSceneUid: function(){
        return this.getPreviousNextUid().previousSceneUid;
    },
    /**
    * Simply returns an object with current scene UID, next scene UID, previous scene UID
    * Returns previousSceneUid = false if it is the first story scene
    * Returns nextSceneUid = false if it is the last story scene
    * @return object
    */
    getPreviousNextUid: function(){
        var isFirst = this.isFirstStoryScene();
        var isLast = this.isLastStoryScene();
        var currentSceneUid = this.getCurrentSceneUid();
        var scenes = viewer.story.scenes;
        var numberOfScenes = scenes.length;
        var obj = {};
        var previousSceneIndex;
        var nextSceneIndex;
        for (var i = 0; i < numberOfScenes; i++) {
            obj[i] = scenes[i].uid;
            if(obj[i] == currentSceneUid){
                previousSceneIndex = i-1;
                nextSceneIndex = i+1;
            }
        }
        if(isFirst){
            return {
                previousSceneUid: false,
                nextSceneUid: obj[nextSceneIndex],
                currentSceneUid: currentSceneUid
            }
        }else if(isLast){
            return {
                previousSceneUid: obj[previousSceneIndex],
                nextSceneUid: false,
                currentSceneUid: currentSceneUid
            }
        }else{
            return {
                previousSceneUid: obj[previousSceneIndex],
                nextSceneUid: obj[nextSceneIndex],
                currentSceneUid: currentSceneUid
            }
        }
    },
    /**
    * Returns the hotspot type of the specified UID string
    * @param {data} string uid of a hotspot
    * @return string
    */
    getHotspotType: function(data){
        //Check if this uid is valid on the current scene
        if(FORGE.UID.get(data) !== undefined){
            return FORGE.UID.get(data).className;
        }else{
            return false;
        }
    },
    /**
    * Get the world coordinates of a hotspot
    * @param {data} string the uid of the hotspot
    * @return an object with world coordinates of the Hotspot3D
    */
    getHotspot3DWorld: function(data){
        //Check if this uid is valid
        if(this.isHotspot3D(data)){
            //Get hotspot yaw and pitch
            var yaw = FORGE.UID.get(data).config.transform.position.theta;
            var pitch = FORGE.UID.get(data).config.transform.position.phi;
            //Then return it into an object
            return {yaw: yaw, pitch: pitch};
        }else{
            return false;
        }
    },
    /**
    * Get the screen left / top values of the world object
    * @param {data} object For example {yaw: 50, pitch: 0}
    * @param {data} string the uid of the hotspot
    * @return an object with screen coordinates of the object or hotspot for example {x: 572, y: 447}
    */
    getWorldToScreen: function(data){
        var yaw = 0, pitch = 0;
        //If it is an object, get yaw and/or pitch value
        if(typeof data == 'object'){
            if(data.yaw !== undefined){
                yaw = data.yaw;
            }
            if(data.pitch !== undefined){
                pitch = data.pitch;
            }
        }else if(typeof data == 'string'){
            //Check if this uid is a valid Hotspot3D on the current scene
            if(this.isHotspot3D(data)){
                //Then replace yaw and pitch values
                yaw = FORGE.UID.get(data).config.transform.position.theta;
                pitch = FORGE.UID.get(data).config.transform.position.phi;
            }
        }else{
            return console.log('need an object with yaw/pitch or a string with hotspot 3D UID');
        }
        //Calculations
        var stc = FORGE.Math.sphericalToCartesian(30, yaw, pitch, FORGE.Math.DEGREES);
        var vector3 = new THREE.Vector3(stc.x, stc.y, stc.z);
        var result = viewer.view.worldToScreen(vector3,0);
        //Return left and top values into an object
        return result;
    },
    /**
    * Returns the class name of the specified UID (Hotspot3D, HotspotDOM, Story, Action, Playlist...)
    * @param {data} string uid of an element
    * @return {String}
    */
    getClassName: function(data){
        //Check if this uid is valid on the current scene
        if(FORGE.UID.get(data) !== undefined){
            return FORGE.UID.get(data).className;
        }else{
            console.log('not a valid uid or not supported');
        }
    },
    /**
    * Returns the current locale UID
    * @return {String} UID of the current locale (returns "" if i18n is disabled)
    */
    getLocale: function(){
        return viewer.i18n.locale;
    },
    /**
    * Returns the description of the current object UID or the current scene description
    * @param {data} string (optional) uid of an element
    * @return {String}
    */
    getDescription: function(data){
        if(data !== undefined){
            if(FORGE.UID.get(data) !== undefined){
                return FORGE.UID.get(data).description;
            }else{
                console.log('not an valid element uid');
            }
        }else{
            //If no data, return the current scene description
            return FORGE.UID.get(this.getCurrentSceneUid()).description;
        }
    },
    /**
    * Returns the title (name) of the current object UID or the current scene title (name)
    * @param {data} string (optional) uid of an element
    * @return {String}
    */
    getTitle: function(data){
        if(data !== undefined){
            if(FORGE.UID.get(data) !== undefined){
                return FORGE.UID.get(data).name;
            }else{
                console.log('not an valid element uid');
            }
        }else{
            //If no data, return the current scene title (name)
            return FORGE.UID.get(this.getCurrentSceneUid()).name;
        }
    },
    /**
    * Returns an object with current playlists informations
    * @return {Object} with { name: "Playlist name sting", [Array of audiotracks names]}
    */
    // getPlaylist: function(){
    //     //Get raw data from playlist
    //     var bulk = viewer.playlists.playlist;
    //     //Add current playlist name
    //     var currentPlaylist = { name: bulk.name };
    //     var tracks = [];
    //     //Iterate for tracks
    //     for (var i = 0; i < bulk.tracks.length; i++) {
    //         var audioTrackUid = bulk.tracks[i];
    //         var infos = FORGE.UID.get(audioTrackUid);
    //         //Push the audio track name into the array
    //         tracks[i] = infos.name;
    //     }
    //     //Add the audio tracks array into the final object
    //     currentPlaylist.tracks = tracks;
    //     //Return the object
    //     return currentPlaylist;
    // },

    /**
    * Asks for the type of media into the current scene
    * @return {String} for example 'image' or 'video'
    */
    getMediaType: function(){
        return FORGE.UID.get(this.getCurrentSceneUid()).media.type;
    },
    /**
    * Get the current volume of the specified source
    * @param    {String} data Specify the volume source to return: 'master', 'scene' or 'playlist'
    * @return   {Number} Level between 0 and 1
    */
    getVolume: function(data){
        if(typeof data == 'string'){
            if(data == 'master'){
                return viewer.audio.volume;
            }else if(data == 'scene'){
                return this.getVideoVolume();
            }else if(data == 'playlist'){
                return viewer.playlists.playlist.volume;
            }else{
                console.log('specified source must be:"master", "playlist" or "scene"');
            }
        }else{
            console.log('must be a string:"master", "playlist" or "scene"');
        }
    },
    /**
    * If the current scene is a video, get the current volume
    * @return {Number} Level between 0 and 1
    */
    getVideoVolume: function(){
        if(this.getMediaType() == 'video'){
            return viewer.story.scene.media.displayObject.volume;
        }else{
            console.log('current scene does not support volume');
        }
    },
    /**
    * If the current scene is a video, get the duration in seconds
    * @return {Number} in seconds
    */
    getVideoDuration: function(){
        if(this.getMediaType() == 'video'){
            return viewer.story.scene.media.displayObject.duration;
        }else{
            console.log('current scene is not a video, cannot return duration');
        }
    },
    /**
    * If the current scene is a video, get the current time in seconds
    * @return {Number} in seconds
    */
    getVideoCurrentTime: function(){
        if(this.getMediaType() == 'video'){
            return viewer.story.scene.media.displayObject.currentTime;
        }else{
            console.log('current scene is not a video, cannot return current time');
        }
    },
    /**
    * Set the specified locale UID
    * @param {String} UID of the target locale
    */
    setLocale: function(data){
        viewer.i18n.locale = data;
    },
    /**
    * Set the specified projection (Rectilinear,flat,gopro)
    * @param {String} projection projection name
    */
    setProjection: function(data){
        if(typeof data == 'string'){
            viewer.view.type = data;
        }
    },
    /**
    * If the current scene is a video, set the volume
    * @param {Number} volume value between 0 (mute) and 1 (max)
    * @param {Object || Boolean} options (optional) optional parameters.
    * IF @param {Boolean}    (optional) if set to true, add a sound fade with default parameters
    * IF @param {Object}     (optional) Customize fade and target parameters
    * |- @param {Number} options.duration (optional) Fade duration ms between
    * |- @param {Function} options.onStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onEnd (optional) Callback function called when transition out ends
    */
    setVideoVolume: function(data,options){
        if(this.getMediaType() == 'video'){
            if(options === undefined){
                var options = { target: 'scene' };
            }else{
                options.target = 'scene';
            }
            this.setVolume(data,options);
            // viewer.story.scene.media.displayObject.volume = parsedData;
        }else{
            console.log('current scene does not support volume change');
        }
    },
    /**
    * Adjust the volume of the specified audio output (master by default)
    * @param {Number || String} volume value between 0 (mute) and 1 (max)
    * @param {Object || Boolean} options (optional) optional parameters.
    * IF @param {Boolean}    (optional) if set to true, add a sound fade with default parameters
    * IF @param {Object}     (optional) Customize fade and target parameters
    * |- @param {Number} options.duration (optional) Fade duration ms between
    * |- @param {String} options.target (optional) Audio source volume returned ('master','scene' or 'playlist')
    * |- @param {Function} options.onStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onEnd (optional) Callback function called when transition out ends
    */
    setVolume: function(data,options){
        //If data is a string, transform to number
        if(typeof data == 'number'){
            parsedData = data;
        }else if(typeof data == 'string'){
            parsedData = parseFloat(data);
        }else{
            console.log('invalid volume argument: must be a number or a string');
            return;
        }
        //value must be between 0 and 1
        if(parsedData >= 0 && parsedData <= 1){
            if(typeof options == 'object' || options){
                //Default parameters
                var params = {
                    duration: 1000,
                    target: 'master',
                    onStart: function(){},
                    onEnd: function(){}
                }

                //If options is an object, use keys to replace default parameters
                if(typeof options == 'object'){
                    //Manage parameters
                    var userProperties = Object.getOwnPropertyNames(options);
                    //Replace each parameter by its new value
                    userProperties.forEach(function(property){
                        if(params.hasOwnProperty(property)){
                            params[property] = options[property];
                        }
                    });
                }

                //Which volume to manage?
                var currentVolume,currentTarget;
                if(params.target == 'master'){
                    currentTarget = viewer.audio;
                }else if(params.target == 'scene'){
                    currentTarget = viewer.story.scene.media.displayObject;
                }else if(params.target == 'playlist'){
                    currentTarget = viewer.playlists.playlist;
                }
                //In any case
                currentVolume = currentTarget.volume;

                //Increase or descrease management
                var fadeIndex;
                if(parsedData < currentVolume){
                    fadeIndex = -1;
                }else{
                    fadeIndex = 1;
                }
                //Difference between current volume and target volume
                var diff = Math.abs(parsedData - currentVolume);
                //Divide this difference in n duration increments
                var increment = diff * fadeIndex / params.duration;
                //var t = performance.now();
                //Now increment until we reach the target volume
                //Trigger start callback
                params.onStart();
                //console.log(typeof params.duration+': '+params.duration+' parsedData: '+parsedData);

                //Security to avoid overflow: Fade duration must be greater than interval time
                var fadeIntervalTimeInMs = 10;
                //If fade duration is greater than interval time
                if(params.duration > fadeIntervalTimeInMs){
                    var interval = setInterval(function(){
                        currentTarget.volume = currentVolume + increment * 10;
                        currentVolume = currentTarget.volume;
                        //Check if we are around the target volume
                        if((currentVolume <= parsedData + Math.abs(increment)) && (currentVolume >= parsedData + Math.abs(increment) * -1)){
                            //var t2 = performance.now();
                            clearInterval(interval);
                            //Trigger end callback
                            params.onEnd();
                            //console.log(t2 - t);
                        }
                    },fadeIntervalTimeInMs);
                //Otherwise, make a simple volume change without fade
                }else{
                    currentTarget.volume = parsedData;
                }

            }else{
                //No options, set the master audio volume
                viewer.audio.volume = parsedData;
            }
        }else{
            console('volume must be a number between 0 and 1');
        }
    },
    /**
    * Go the the specified scene uid
    * Optional transition effect based on CSS:
    * Class name 'transition' (default customizable) is added to the Forge container at start
    * On transition In end: Target scene is loaded and a callback is available
    * Once loaded, the transition Out starts
    * Once transition Out ends, the 'transition' css class is removed and a callback is available
    *
    * @param {String} data (required) UID of the destination scene
    * @param {Object || Boolean} options (optional) Optional parameters
    * IF @param {Boolean}    (optional) if set to true, add a transition effect based on CSS with default parameters
    * IF @param {Object}     (optional) Customize transition parameters
    * |- @param {String} options.cssClassName (optional) CSS class name added to the Forge container during transitions
    * |- @param {String} options.cssStylesheetId (optional) ID of the temp CSS stylesheet incl. during transition
    * |- @param {String} options.durationIn (optional) Duration of the transition In (CSS declaration)
    * |- @param {String} options.durationOut (optional) Duration of the transition Out (CSS declaration)
    * |- @param {Number} options.delayBetweenInOut (optional) Delay in ms between transitionInEnd and transitionOutStart
    * |- @param {Function} options.onTransitionInStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onTransitionInEnd (optional) Callback function called when transition in ends
    * |- @param {Function} options.onTransitionOutStart (optional) Callback function called when transition out starts
    * |- @param {Function} options.onTransitionOutEnd (optional) Callback function called when transition out ends
    */
    goToScene: function(data, options){
        //Check if data is a string
        if(typeof data == 'string'){
            //Asks FORGE if this uid is really a scene
            if(this.isScene(data)){
                //Verify it is an object and not undefined
                if(typeof options == 'object' || options == true){
                    //And if current scene is not the target scene
                    if(this.getCurrentSceneUid() != data){
                        //Default parameters of transition options
                        var api = this;
                        var params = {
                            cssClassName: 'transition',
                            cssStylesheetId: 'transitionStylesheet',
                            durationIn: '800ms',
                            durationOut: '1500ms',
                            delayBetweenInOut: 0, //in ms
                            onTransitionInStart: function(){
                                var targetFov = api.getFov() / 1.2;
                                api.goToView({
                                    fov: targetFov,
                                    easing: 'linear',
                                    durationMS: 800
                                });
                            },
                            onTransitionInEnd: function(){
                                var targetFov = api.getFov() * 1.1;
                                api.goToView({
                                    fov: targetFov,
                                    durationMS: 0
                                });
                            },
                            onTransitionOutStart: function(){
                                var targetFov = api.getFov() / 1.1;
                                api.goToView({
                                    fov: targetFov,
                                    easing: 'linear',
                                    durationMS: 1200
                                });
                            },
                            onTransitionOutEnd: function(){}
                        }

                        //If options is an object, use keys to replace default parameters
                        if(typeof options == 'object'){
                            //Manage parameters
                            var userProperties = Object.getOwnPropertyNames(options);
                            //Replace each parameter by its new value
                            userProperties.forEach(function(property){
                                if(params.hasOwnProperty(property)){
                                    params[property] = options[property];
                                }
                            });
                        }

                        //Shortcut Forge container
                        var forgeContainer = viewer.container.dom.parentNode.parentNode;
                        //Forge container ID
                        var forgeContainerID = forgeContainer.getAttribute('id');
                        //Create a stylesheet
                        var transitionStylesheet = document.createElement('style');
                        //Create CSS declaration
                        var transitionStylesheetDeclarations =  '#'+forgeContainerID+' {'+
                                                                    'transition: opacity '+params.durationOut+';'+
                                                                '}'+
                                                                '#'+forgeContainerID+'.'+params.cssClassName+' {'+
                                                                    'opacity: 0;'+
                                                                    'transition: opacity '+params.durationIn+';'+
                                                                '}';
                        //Include declaration into stylesheeet
                        transitionStylesheet.innerHTML = transitionStylesheetDeclarations;
                        //Customize the style node id attribute
                        transitionStylesheet.setAttribute('id',params.cssStylesheetId);
                        //Include into the DOM
                        document.body.appendChild(transitionStylesheet);
                        //When transitionOut duration ends
                        function transitionOutEndCallback(e) {
                            // remove this callback
                        	e.target.removeEventListener(e.type, arguments.callee);
                            //Remove included stylesheet
                            if(document.getElementById(params.cssStylesheetId) != null){
                                document.getElementById(params.cssStylesheetId).remove();
                                //Execute the optional transition Out end callback
                                params.onTransitionOutEnd();
                            }
                        }
                        //When transitionIn duration ends
                        function transitionInEndCallback(e) {
                        	// remove this callback
                        	e.target.removeEventListener(e.type, arguments.callee);
                            //Listen target scene is loaded, then remove listener
                            viewer.story.onSceneLoadComplete.addOnce(function(){
                                //Scene is loaded, wait for a specific delay before starting transition out
                                setTimeout(function(){
                                    //Remove CSS class
                                    forgeContainer.classList.remove(params.cssClassName);
                                    //Execute the optional transition Out Start callback
                                    params.onTransitionOutStart();
                                    //Wait for transitionOut end, then run callback function
                                    forgeContainer.addEventListener('transitionend',transitionOutEndCallback);
                                },params.delayBetweenInOut);
                            });
                            //Then load the scene specified
                            viewer.story.loadScene(data);
                            //Execute the optional transition In end callback
                            params.onTransitionInEnd();
                        }

                        //Wait for transition end, then run callback function
                        forgeContainer.addEventListener('transitionend',transitionInEndCallback);

                        //Execute the optional transition In Start callback
                        params.onTransitionInStart();

                        //Finally we add the class name "transition" to the Forge container
                        forgeContainer.classList.add(params.cssClassName);
                    }
                }else{
                    //Check if it is the current scene
                    if(this.getCurrentSceneUid() == data){
                        console.log('target is current scene');
                    }else{
                        //It is ok, no options, simply load the scene specified
                        viewer.story.loadScene(data);
                    }
                }
            }else{
                //Get out if data is not a valid scene uid
                console.log('not a valid scene uid');
                return;
            }
        }else{
            //Get out if data is not a string
            console.log('not a string');
            return;
        }
    },
    /**
    * if current scene is a video, play the video
    */
    playVideo: function(){
        if(this.getMediaType() == 'video'){
            viewer.story.scene.media.displayObject.play();
        }
    },
    /**
    * if current scene is a video, pause the video
    */
    pauseVideo: function(){
        if(this.getMediaType() == 'video'){
            viewer.story.scene.media.displayObject.pause();
        }
    },
    /**
    * if current scene is a video, stop the video
    */
    stopVideo: function(){
        if(this.getMediaType() == 'video'){
            viewer.story.scene.media.displayObject.stop();
        }
    },
    /**
    * Play current playlist
    */
    playPlaylist: function(){
        viewer.playlists.playlist.play();
    },
    /**
    * Stop current playlist
    */
    stopPlaylist: function(){
        viewer.playlists.playlist.stop();
    },
    /**
    * Pause current playlist
    */
    pausePlaylist: function(){
        viewer.playlists.playlist.pause();
    },
    /**
    * Resume current playlist
    */
    resumePlaylist: function(){
        viewer.playlists.playlist.resume();
    },
    /**
    * Jump Forge to the next scene
    * @param {Object || Boolean} options (optional) Optional parameters
    * IF @param {Boolean}    (optional) if set to true, add a transition effect based on CSS with default parameters
    * IF @param {Object}     (optional) Customize transition parameters
    * |- @param {String} options.cssClassName (optional) CSS class name added to the Forge container during transitions
    * |- @param {String} options.cssStylesheetId (optional) ID of the temp CSS stylesheet incl. during transition
    * |- @param {String} options.durationIn (optional) Duration of the transition In (CSS declaration)
    * |- @param {String} options.durationOut (optional) Duration of the transition Out (CSS declaration)
    * |- @param {Number} options.delayBetweenInOut (optional) Delay in ms between transitionInEnd and transitionOutStart
    * |- @param {Function} options.onTransitionInStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onTransitionInEnd (optional) Callback function called when transition in ends
    * |- @param {Function} options.onTransitionOutStart (optional) Callback function called when transition out starts
    * |- @param {Function} options.onTransitionOutEnd (optional) Callback function called when transition out ends
    */
    goToNextScene: function(options){
        var nextSceneUid = this.getNextSceneUid();
        if(nextSceneUid !== false){
            this.goToScene(nextSceneUid,options);
        }
    },
    /**
    * Jump Forge to the previous scene
    * @param {Object || Boolean} options (optional) Optional parameters
    * IF @param {Boolean}    (optional) if set to true, add a transition effect based on CSS with default parameters
    * IF @param {Object}     (optional) Customize transition parameters
    * |- @param {String} options.cssClassName (optional) CSS class name added to the Forge container during transitions
    * |- @param {String} options.cssStylesheetId (optional) ID of the temp CSS stylesheet incl. during transition
    * |- @param {String} options.durationIn (optional) Duration of the transition In (CSS declaration)
    * |- @param {String} options.durationOut (optional) Duration of the transition Out (CSS declaration)
    * |- @param {Number} options.delayBetweenInOut (optional) Delay in ms between transitionInEnd and transitionOutStart
    * |- @param {Function} options.onTransitionInStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onTransitionInEnd (optional) Callback function called when transition in ends
    * |- @param {Function} options.onTransitionOutStart (optional) Callback function called when transition out starts
    * |- @param {Function} options.onTransitionOutEnd (optional) Callback function called when transition out ends
    */
    goToPreviousScene: function(options){
        var previousSceneUid = this.getPreviousSceneUid();
        if(previousSceneUid !== false){
            this.goToScene(previousSceneUid,options);
        }
    },
    /**
    * Jump Forge to the first scene
    * @param {Object || Boolean} options (optional) Optional parameters
    * IF @param {Boolean}    (optional) if set to true, add a transition effect based on CSS with default parameters
    * IF @param {Object}     (optional) Customize transition parameters
    * |- @param {String} options.cssClassName (optional) CSS class name added to the Forge container during transitions
    * |- @param {String} options.cssStylesheetId (optional) ID of the temp CSS stylesheet incl. during transition
    * |- @param {String} options.durationIn (optional) Duration of the transition In (CSS declaration)
    * |- @param {String} options.durationOut (optional) Duration of the transition Out (CSS declaration)
    * |- @param {Number} options.delayBetweenInOut (optional) Delay in ms between transitionInEnd and transitionOutStart
    * |- @param {Function} options.onTransitionInStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onTransitionInEnd (optional) Callback function called when transition in ends
    * |- @param {Function} options.onTransitionOutStart (optional) Callback function called when transition out starts
    * |- @param {Function} options.onTransitionOutEnd (optional) Callback function called when transition out ends
    */
    goToFirstScene: function(options){
        //Get the first id
        var firstSceneUid = viewer.story.scenes[0].config.uid;
        //Check if the current scene is not the 1st
        if(this.isFirstStoryScene() == false){
            //Then go to the first scene
            this.goToScene(firstSceneUid,options);
        }
    },
    /**
    * Jump Forge to the last scene
    * @param {Object || Boolean} options (optional) Optional parameters
    * IF @param {Boolean}    (optional) if set to true, add a transition effect based on CSS with default parameters
    * IF @param {Object}     (optional) Customize transition parameters
    * |- @param {String} options.cssClassName (optional) CSS class name added to the Forge container during transitions
    * |- @param {String} options.cssStylesheetId (optional) ID of the temp CSS stylesheet incl. during transition
    * |- @param {String} options.durationIn (optional) Duration of the transition In (CSS declaration)
    * |- @param {String} options.durationOut (optional) Duration of the transition Out (CSS declaration)
    * |- @param {Number} options.delayBetweenInOut (optional) Delay in ms between transitionInEnd and transitionOutStart
    * |- @param {Function} options.onTransitionInStart (optional) Callback function called when transition in start
    * |- @param {Function} options.onTransitionInEnd (optional) Callback function called when transition in ends
    * |- @param {Function} options.onTransitionOutStart (optional) Callback function called when transition out starts
    * |- @param {Function} options.onTransitionOutEnd (optional) Callback function called when transition out ends
    */
    goToLastScene: function(options){
        //Get the number of scenes
        var numberOfScenes = viewer.story.scenes.length;
        for (var i = 0; i < numberOfScenes; i++) {
            if(i == (numberOfScenes - 1)){
                var lastSceneUid = viewer.story.scenes[i].uid;
                this.goToScene(lastSceneUid,options);
            }
        }
    },
    /**
    * Go the the specified view into the current scene
    * @param {Object} data containing parameters to be changed
    * Same parameters names as https://releases.forgejs.org/latest/doc/jsdoc/FORGE.Camera.html#lookAt
    * For example:
    * shortapi.goToView({yaw: 120, durationMS: 5000}) will tween camera yaw to 120 in 5 seconds
    * |- @param {Number} data.yaw Set the target yaw
    * |- @param {Number} data.pitch Set the target pitch
    * |- @param {Number} data.roll Set the target roll
    * |- @param {Number} data.fov Set the target fov
    * |- @param {Number} data.durationMS Set the tween duration in ms
    * |- @param {Number} data.easing Set the easing mode
    * |- @param {Boolean} data.cancelRoll Set the cancelRoll
    * |- @param {Function} data.onStart Callback function called when camera animation starts
    * |- @param {Function} data.onEnd Callback function called when camera animation ends
    */
    goToView: function(data){

        //If the argument is an object, use data included into this object
        if(typeof data == 'object'){
            //Default values
            //Same parameters names as https://releases.forgejs.org/latest/doc/jsdoc/FORGE.Camera.html#lookAt
            var params = {
                yaw: null,
                pitch: null,
                roll: null,
                fov: viewer.camera.fov,
                durationMS: 2000,
                cancelRoll: false,
                easing: 'easeInOutCubic',
                onStart: function(){},
                onEnd: function(){}
            };

            //Manage properties to tween from data argument
            var properties = Object.getOwnPropertyNames(data);
            //Replace each parameter by its new value
            properties.forEach(function(property){
                if(params.hasOwnProperty(property)){
                    params[property] = data[property];
                }
            });

            //If there is a Hotspot3D UID, use its yaw and pitch
            if(data.uid !== undefined){
                if(this.isHotspot3D(data.uid)){
                    params.yaw = this.getHotspot3DWorld(data.uid).yaw;
                    params.pitch = this.getHotspot3DWorld(data.uid).pitch;
                }
            }
            //Add a callback function when tweening is launched
            params.onStart();

            //Add a callback function when tweening is finished
            viewer.camera.animation.onComplete.addOnce(function(){
                params.onEnd();
            });
        }else{
            return;
        }
        //Launch the tweening
        viewer.camera.lookAt(params.yaw, params.pitch, params.roll, params.fov, params.durationMS, params.cancelRoll, params.easing);
    },
    /**
    * Asks if the specified string is a valid uid of a Hotspot3D in the current scene
    * @param {data} string uid of the Hotspot3D
    * @return boolean
    */
    isHotspot3D: function(data){
        if(this.getHotspotType(data) == 'Hotspot3D'){
            return true;
        }else{
            return false;
        }
    },
    /**
    * Asks if the specified string is a valid uid of a HotspotDOM in the current scene
    * @param {data} string uid of the HotspotDOM
    * @return boolean
    */
    isHotspotDOM: function(data){
        if(this.getHotspotType(data) == 'HotspotDOM'){
            return true;
        }else{
            return false;
        }
    },
    /**
    * Asks if the specified string is a valid uid of a scene
    * @param {data} string uid of the scene
    * @return boolean
    */
    isScene: function(data){
        //Check if this uid is valid
        if(FORGE.UID.get(data) !== undefined){
            //Check if it is a scene
            if(FORGE.UID.get(data).className == 'Scene'){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    },
    /**
    * Asks if the specified string is the last scene of the story
    * @param {data} string - optional - UID of the scene. If not specified, current scene UID is used
    * @return boolean
    */
    isLastStoryScene: function(data){
        //If data is not set, use current scene UID
        var keyString;
        if(data === undefined){
            keyString = this.getCurrentSceneUid();
        }else{
            keyString = data;
        }

        //Check if this uid is valid
        if(this.isScene(keyString)){
            var numberOfScenes = viewer.story.scenes.length;
            var obj = {};
            for (var i = 0; i < numberOfScenes; i++) {
                obj[i] = viewer.story.scenes[i].uid;
            }
            if(obj[numberOfScenes - 1] == keyString){
                return true;
            }else{
                return false;
            }
        }
    },
    /**
    * Asks if the specified string is the first scene of the story
    * @param {data} string - optional - UID of the scene. If not specified, current scene UID is used
    * @return boolean
    */
    isFirstStoryScene: function(data){
        //If data is not set, use current scene UID
        var keyString;
        if(data === undefined){
            keyString = this.getCurrentSceneUid();
        }else{
            keyString = data;
        }
        //Check if this uid is valid
        if(this.isScene(keyString)){
            if(viewer.story.scenes[0].config.uid == keyString){
                return true;
            }else{
                return false;
            }
        }
    }
}
