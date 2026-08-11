import { WebView } from '@nativescript/core';

declare const WKWebViewConfiguration: any;
declare const WKWebView: any;
declare const CGRectZero: any;
declare const NSMutableURLRequest: any;
declare const NSURL: any;
declare const NSObject: any;

const REFERER_URL = "mobile.ethrai.sa";

/**
 * iOS-specific WebView that enables inline video playback,
 * includes Referer header support, and provides a JS→native bridge
 * via WKScriptMessageHandler for reliable event communication.
 */
export class InlineVideoWebView extends WebView {
    private _messageHandler: any;

    createNativeView(): any {
        try {
            // Create a new configuration with inline media playback enabled
            const configuration = WKWebViewConfiguration.new();

            // Enable inline playback (prevents fullscreen)
            configuration.allowsInlineMediaPlayback = true;

            // Don't require user action for media playback (allows autoplay)
            // 0 = WKAudiovisualMediaTypeNone
            configuration.mediaTypesRequiringUserActionForPlayback = 0;

            // Allow AirPlay
            configuration.allowsAirPlayForMediaPlayback = true;

            // --- Add WKScriptMessageHandler for JS→native bridge ---
            const ownerRef = this;

            const WKScriptMessageHandlerImpl = NSObject.extend({
                userContentControllerDidReceiveScriptMessage(userContentController: any, message: any) {
                    const self = ownerRef;
                    if (!self) return;
                    try {
                        const body = message.body;
                        // body is a string like "eventName|data"
                        const pipeIndex = body.indexOf('|');
                        const eventName = pipeIndex > -1 ? body.substring(0, pipeIndex) : body;
                        const eventData = pipeIndex > -1 ? body.substring(pipeIndex + 1) : null;

                        console.log('Bridge received:', eventName, eventData ? eventData.substring(0, 50) : '');

                        // Fire the event on this WebView instance
                        self.notify({ eventName: eventName, object: self, data: eventData });
                    } catch (e) {
                        console.error('Bridge message error:', e);
                    }
                }
            }, {
                protocols: [WKScriptMessageHandler]
            });

            this._messageHandler = WKScriptMessageHandlerImpl.new();
            configuration.userContentController.addScriptMessageHandlerName(this._messageHandler, 'nsBridge');

            console.log('InlineVideoWebView: Creating iOS WKWebView with inline playback + bridge');

            // Create WKWebView with the configured configuration
            const webView = WKWebView.alloc().initWithFrameConfiguration(CGRectZero, configuration);

            return webView;
        } catch (e) {
            console.error('InlineVideoWebView: Failed to create iOS WKWebView:', e);
            return super.createNativeView();
        }
    }

    disposeNativeView(): void {
        try {
            if (this.ios && this.ios.configuration) {
                this.ios.configuration.userContentController.removeScriptMessageHandlerForName('nsBridge');
            }
        } catch (e) {
            console.log('InlineVideoWebView: cleanup error:', e);
        }
        this._messageHandler = null;
        super.disposeNativeView();
    }

    /**
     * Load HTML content with Referer header
     */
    loadWithReferer(htmlString: string): void {
        try {
            if (this.ios) {
                const encodedHtml = encodeURIComponent(htmlString);
                const dataUrl = `data:text/html;charset=utf-8,${encodedHtml}`;

                const nsUrl = NSURL.URLWithString(dataUrl);
                const request = NSMutableURLRequest.requestWithURL(nsUrl);
                request.setValueForHTTPHeaderField(REFERER_URL, "Referer");

                this.ios.loadRequest(request);
                console.log('InlineVideoWebView: iOS loaded with Referer header');
            }
        } catch (e) {
            console.error('InlineVideoWebView: Error loading with Referer:', e);
            // Fallback to standard src loading
            this.src = htmlString;
        }
    }
}

// Export the WKScriptMessageHandler protocol reference
declare const WKScriptMessageHandler: any;
