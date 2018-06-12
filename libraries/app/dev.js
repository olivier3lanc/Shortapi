//Get current yaw pitch fov
var ypf = function(){
    console.log('YAW: '+viewer.camera.yaw);
    console.log('PITCH: '+viewer.camera.pitch);
    console.log('FOV: '+viewer.camera.fov);
}

//Double click to get yaw/pitch/fov of the cursor into the console
viewer.onConfigLoadComplete.add(function(e){
    viewer.story.onSceneLoadComplete.add(function(e){
        jQuery('#container canvas').on('dblclick',function(e){
            var screenPosition = FORGE.Pointer.getRelativeMousePosition(e);
            var stw = viewer.view.screenToWorld(screenPosition);
            var spherical = FORGE.Math.cartesianToSpherical(stw.x, stw.y, stw.z, FORGE.Math.DEGREES);
            var yaw = spherical.theta,
                pitch = spherical.phi;
            console.log('YAW:'+yaw);
            console.log('PITCH:'+pitch);
            console.log('FOV:'+viewer.camera.fov);
        });
    });
});
