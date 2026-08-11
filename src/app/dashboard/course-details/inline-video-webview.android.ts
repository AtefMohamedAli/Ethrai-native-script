// Android version - custom WebView with Referer header support + JS→native bridge
import { WebView, Utils } from '@nativescript/core';

declare const android: any;
declare const java: any;

const REFERER_URL = "mobile.ethrai.sa";

/**
 * Android-specific WebView that:
 * 1. Adds Referer header to video requests
 * 2. Provides a WebChromeClient.onJsPrompt bridge for JS→native event communication
 *    (equivalent to iOS's WKScriptMessageHandler)
 */
export class InlineVideoWebView extends WebView {
    private _webViewClient: any;

    createNativeView(): any {
        try {
            const webView = new android.webkit.WebView(this._context);

            // Configure WebView settings
            const settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

            // --- Add WebChromeClient bridge for JS→native communication ---
            // Using onJsPrompt as bridge (more reliable than @JavascriptInterface in NativeScript)

            // NativeScript Android views often have an 'owner' or '__ns_view' property attached.
            // But to be safe against view recycling, we attach the owner reference directly to the native view.
            (webView as any).__ns_owner = this;

            const CustomWebChromeClient = android.webkit.WebChromeClient.extend({
                onJsPrompt: function (view: any, url: string, message: string, defaultValue: string, result: any) {
                    try {
                        // Check if this is a bridge message
                        if (message && message.indexOf('ns-bridge:') === 0) {
                            const payload = message.substring('ns-bridge:'.length);
                            const pipeIndex = payload.indexOf('|');
                            const eventName = pipeIndex > -1 ? payload.substring(0, pipeIndex) : payload;
                            const eventData = pipeIndex > -1 ? payload.substring(pipeIndex + 1) : null;

                            // Retrieve the MOST CURRENT owner from the view itself, defeating view caching traps.
                            const currentOwner = view.__ns_owner;

                            if (currentOwner) {
                                // Fire the event on the WebView instance (must be on UI thread)
                                Utils.executeOnMainThread(() => {
                                    currentOwner.notify({ eventName: eventName, object: currentOwner, data: eventData });
                                });
                            }

                            // Confirm the prompt so JS continues
                            result.confirm('');
                            return true;
                        }
                    } catch (e) {
                        console.error('Android Bridge message error:', e);
                    }
                    // Not a bridge message; allow default prompt handling
                    return false;
                }
            });

            webView.setWebChromeClient(new CustomWebChromeClient());
            console.log('InlineVideoWebView: Android JS bridge registered via WebChromeClient.onJsPrompt');

            // Create custom WebViewClient to intercept requests and add Referer header
            const CustomWebViewClient = android.webkit.WebViewClient.extend({
                shouldInterceptRequest: function (view: any, request: any) {
                    try {
                        const url = request.getUrl().toString();

                        // Skip bridge URLs
                        if (url.includes('ns-bridge')) {
                            return null;
                        }

                        // Check if this is a video/media request that needs Referer header
                        if (url.includes('.m3u8') || url.includes('.mp4') || url.includes('.ts') ||
                            url.includes('alibaba') || url.includes('aliyun') || url.includes('alicdn') ||
                            url.includes('vod')) {

                            console.log('InlineVideoWebView: Adding Referer header for:', url);

                            // Create a new request with the Referer header
                            const connection = new java.net.URL(url).openConnection();
                            connection.setRequestProperty("Referer", REFERER_URL);
                            connection.setConnectTimeout(30000);
                            connection.setReadTimeout(30000);

                            // Copy original headers
                            const originalHeaders = request.getRequestHeaders();
                            if (originalHeaders) {
                                const iterator = originalHeaders.keySet().iterator();
                                while (iterator.hasNext()) {
                                    const key = iterator.next();
                                    if (key.toLowerCase() !== "referer") {
                                        connection.setRequestProperty(key, originalHeaders.get(key));
                                    }
                                }
                            }

                            connection.connect();

                            const inputStream = connection.getInputStream();
                            const mimeType = connection.getContentType() || "application/octet-stream";
                            const encoding = connection.getContentEncoding() || "utf-8";

                            return new android.webkit.WebResourceResponse(mimeType, encoding, inputStream);
                        }
                    } catch (e) {
                        console.error('InlineVideoWebView: Error intercepting request:', e);
                    }
                    return null; // Let WebView handle normal requests
                },
                // Fallback bridge: intercept ns-bridge:// URL navigations
                shouldOverrideUrlLoading: function (view: any, request: any) {
                    try {
                        const url = typeof request === 'string' ? request : request.getUrl().toString();
                        if (url.includes('ns-bridge')) {
                            const bridgeIndex = url.indexOf('ns-bridge/');
                            if (bridgeIndex > -1) {
                                const afterBridge = url.substring(bridgeIndex + 'ns-bridge/'.length);
                                const eventName = afterBridge.split('?')[0];
                                let eventData: any = null;

                                if (url.includes('data=')) {
                                    try {
                                        const params = url.split('?')[1];
                                        const dataParam = params.split('data=')[1];
                                        eventData = decodeURIComponent(dataParam);
                                    } catch (e) {
                                        console.log('URL bridge parse error:', e);
                                    }
                                }

                                const currentOwner = view.__ns_owner;
                                if (currentOwner) {
                                    Utils.executeOnMainThread(() => {
                                        currentOwner.notify({ eventName: eventName, object: currentOwner, data: eventData });
                                    });
                                }
                            }
                            return true; // Consume the URL, don't navigate
                        }
                    } catch (e) {
                        console.error('InlineVideoWebView: shouldOverrideUrlLoading error:', e);
                    }
                    return false;
                },
                onPageFinished: function (view: any, url: string) {
                    console.log('InlineVideoWebView: Page finished loading:', url);
                },
                onReceivedError: function (view: any, request: any, error: any) {
                    console.error('InlineVideoWebView: WebView error:', error);
                }
            });

            this._webViewClient = new CustomWebViewClient();
            webView.setWebViewClient(this._webViewClient);

            console.log('InlineVideoWebView: Android WebView created with Referer header + JS bridge support');
            return webView;
        } catch (e) {
            console.error('InlineVideoWebView: Failed to create Android WebView:', e);
            return super.createNativeView();
        }
    }

    disposeNativeView(): void {
        this._webViewClient = null;
        super.disposeNativeView();
    }
}
