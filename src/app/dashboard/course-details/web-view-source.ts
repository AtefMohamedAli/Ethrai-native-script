
export class WebViewSource {
  videoCode: string = "";
  time: any;

  constructor(videoCode: string, time = 0) {
    this.videoCode = videoCode,
      this.time = time
  }
  getHtmlString() {
    let html = `

    <html>
    <head>
    <style>
    </style>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
      <body>
        <script>
        var Video;
        window._wq = window._wq || [];
        var obj={ id:"`+ this.videoCode + `",
        options:{
          autoPlay: true,
          fullscreenOnRotateToLandscape:false,
          playsinline:true,
          //  silentAutoPlay:false
        },
        onReady: function(video) {
          Video=video;
    video.bind("end", function() {
      window.nsWebViewBridge.emit('end','');    
    });
    video.bind("play", function() {
      window.nsWebViewBridge.emit('play','');
    });
    video.bind("pause", function() {
      window.nsWebViewBridge.emit('pause','');
    
    });

    video.bind("timechange", function(t) {
      window.nsWebViewBridge.emit('timechange',t);
    
    });

    video.bind("seek", function(currentTime, lastTime) {
     // console.log(currentTime,lastTime)
     if(lastTime<currentTime){
      video.time(lastTime)
  }
    });

    video.bind("percentwatchedchanged", function(percent,lastPercent) {
      if (percent >= .80 && lastPercent < .80) {
        window.nsWebViewBridge.emit('percentwatchedchanged', percent);
      }
    
    });
    
        }
      
      }
        _wq.push(obj);
      window.addEventListener("ns-bridge-ready", function(e) {
        var nsWebViewBridge = e.detail || window.nsWebViewBridge;
        window.nsWebViewBridge.on("pauseVideo", data =>{Video.pause()})
        window.nsWebViewBridge.on("seekTo", data =>{console.log("seek to event",data),Video.time(data)})

      });
      
        </script>
        <div class="wistia_embed wistia_async_`+ this.videoCode + `"></div>
        <script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>
      </body>
    </html>
    `
    return html;
  }
  getBlankView() {
    let html = `

  <html>
  <head>
  <style>
  </style>
  </head>
    <body>
     
    </body>
  </html>
  `
    return html;
  }
}