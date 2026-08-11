export class AlibabaHTMLGenerator {
  private coverUrl: string;
  private videoSources: { play_url: string, definition: string }[] = [];
  private subtitleTracks: any = [];

  constructor(coverUrl: string, videoSources: { play_url: string, definition: string }[], subtitleTracks: any) {
    this.coverUrl = coverUrl?.split('?')[0] || '';
    this.videoSources = videoSources || [];

    if (subtitleTracks && Array.isArray(subtitleTracks.subtitles)) {
      this.subtitleTracks = subtitleTracks?.subtitles.map((s: any) => ({
        kind: "subtitles",
        label: s.label || "Subtitle",
        src: s.src,
        srclang: s.srclang || "en",
      })) || [];
    }
    console.log(this.subtitleTracks, 'Final JSON for Player');
  }

  generateHTML(): string {
    // Get HLS (m3u8) and MP4 sources - prefer HLS for iOS
    const m3u8Source = this.videoSources.find(s => s.play_url?.endsWith('.m3u8'));
    const mp4Source = this.videoSources.find(s => s.play_url?.endsWith('.mp4'));

    const m3u8Url = m3u8Source?.play_url || '';
    const mp4Url = mp4Source?.play_url || '';

    console.log('AlibabaHTMLGenerator - m3u8:', m3u8Url ? 'found' : 'not found');
    console.log('AlibabaHTMLGenerator - mp4:', mp4Url ? mp4Url : 'not found');

    // Build subtitle tracks HTML
    let subtitleTracksHtml = '';
    if (this.subtitleTracks.length > 0) {
      subtitleTracksHtml = this.subtitleTracks.map((track: any) =>
        `<track kind="${track.kind}" label="${track.label}" src="${track.src}" srclang="${track.srclang}">`
      ).join('\n  ');
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background-color: #000000;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
    video {
      width: 100%;
      height: 100%;
      background-color: #000000;
      object-fit: contain;
    }
  </style>
</head>
<body>

<video
  id="player"
  controls
  playsinline
  webkit-playsinline
  preload="metadata"
  poster="${this.coverUrl}">
  ${m3u8Url ? `<source src="${m3u8Url}" type="application/vnd.apple.mpegurl">` : ''}
  ${mp4Url ? `<source src="${mp4Url}" type="video/mp4">` : ''}
  ${subtitleTracksHtml}
</video>

<script>
  const video = document.getElementById("player");
  
  // Expose Video globally for cleanup in goBack()
  window.Video = {
    remove: function() {
      console.log("Video.remove() called");
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    }
  };

  // --- Bridge shim: JS → NativeScript communication ---
  window.nsWebViewBridge = {
    emit: function(name, data) {
      try {
        // iOS: use WKScriptMessageHandler (registered as 'nsBridge')
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nsBridge) {
          window.webkit.messageHandlers.nsBridge.postMessage(name + '|' + (data != null ? data : ''));
          return;
        }
        // Android: use prompt() which is intercepted by WebChromeClient.onJsPrompt
        // This is more reliable than JavascriptInterface in NativeScript
        try {
          var result = prompt('ns-bridge:' + name + '|' + (data != null ? data : ''));
          if (result !== null && result !== undefined) {
            return; // Bridge handled it
          }
        } catch(pe) {
          // prompt not available or blocked, fall through to iframe
        }
        // Fallback: URL-based approach via hidden iframe
        var url = 'https://ns-bridge/' + name + '?data=' + encodeURIComponent(data != null ? data : '');
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(function() { iframe.remove(); }, 100);
      } catch(e) {
        console.log('Bridge emit error:', e);
      }
    }
  };

  // Debug log
  console.log("Video player script init");
  console.log("Bridge available:", !!window.nsWebViewBridge);
  console.log("M3U8 URL:", "${m3u8Url}");
  console.log("MP4 URL:", "${mp4Url}");

  video.addEventListener("loadstart", function() {
    console.log("Video loadstart event");
  });

  video.addEventListener("loadedmetadata", function() {
    console.log("Video metadata loaded - duration:", video.duration);
    console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
  });

  video.addEventListener("loadeddata", function() {
    console.log("Video data loaded");
  });

  video.addEventListener("canplay", function() {
    console.log("Video can play");
  });

  video.addEventListener("play", function() {
    console.log("Video play event");
    if (window.nsWebViewBridge) {
      window.nsWebViewBridge.emit("play", "play");
    }
  });

  video.addEventListener("pause", function() {
    console.log("Video pause event");
    if (window.nsWebViewBridge) {
      window.nsWebViewBridge.emit("pause", "pause");
    }
  });

  var endedFired = false;

  video.addEventListener("ended", function() {
    console.log("Video ended event");
    if (!endedFired) {
      endedFired = true;
      if (window.nsWebViewBridge) {
        window.nsWebViewBridge.emit("end", "end");
      }
    }
  });

  video.addEventListener("timeupdate", function() {
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    // Emit time change
    if (window.nsWebViewBridge) {
      window.nsWebViewBridge.emit("timechange", currentTime);
    }
    
    // Check completion and progress
    if (duration > 0) {
      const percentWatched = (currentTime / duration) * 100;
      // Fallback: Android WebView may not fire 'ended' for HLS streams
      if (percentWatched >= 98 && !endedFired) {
        endedFired = true;
        console.log("Video near-end fallback triggered at", percentWatched.toFixed(1), "%");
        if (window.nsWebViewBridge) {
          window.nsWebViewBridge.emit("end", "end");
        }
      }
      if (percentWatched >= 80 && window.nsWebViewBridge) {
        window.nsWebViewBridge.emit("percentwatchedchanged", percentWatched);
      }
    }
  });

  video.addEventListener("error", function(e) {
    console.error("Video error event");
    console.error("Video error code:", video.error ? video.error.code : "unknown");
    console.error("Video error message:", video.error ? video.error.message : "unknown");
    console.error("Video src:", video.currentSrc);
    console.error("Video networkState:", video.networkState);
    console.error("Video readyState:", video.readyState);
  });
  
  // Try to load video
  video.load();
  console.log("Video load() called");
</script>

</body>
</html>`;
  }
}
