
export class WebViewSource {
 
  getHtmlString(){
   let html =`
   <html>
   <head>
     <title>reCAPTCHA demo: Explicit render after an onload callback</title>
     <script type="text/javascript">
       var onloadCallback = function() {
         grecaptcha.render('html_element', {
           'sitekey' : '6LfSd0ocAAAAAFggY8vnKJe-VrcWE7LWckU5dCEF'
         });
       };
       window.addEventListener("ns-bridge-ready", function(e) {
        var nsWebViewBridge = e.detail || window.nsWebViewBridge;
        window.nsWebViewBridge.emit("captcha",grecaptcha.getResponse());

        window.nsWebViewBridge.on("getCaptcha", () => {
			window.nsWebViewBridge.emit("captcha",grecaptcha.getResponse());
		})
    });
     </script>
   </head>
   <body>
     <form action="?" method="POST">
       <div id="html_element"></div>
       <br>
     </form>
     <script src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
         async defer>
     </script>
   </body>
 </html>
    `
    return html;
  }

}