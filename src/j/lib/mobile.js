if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
  if( window.addEventListener ){
    window.addEventListener( "load",function() {
      setTimeout(function(){
        window.scrollTo(0, 0);
      }, 0);
    });
    window.addEventListener( "orientationchange",function() {
      setTimeout(function(){
        window.scrollTo(0, 0);
      }, 0);
    });
    window.addEventListener( "touchstart",function() {
      setTimeout(function(){
        window.scrollTo(0, 0);
      }, 0);
    });
  }
}
