import { isIOS, isAndroid, Frame, Color, Screen } from '@nativescript/core';
import * as application from '@nativescript/core/application';

declare const android: any;
declare const UIView: any;
declare const UILabel: any;
declare const CGRectMake: any;
declare const UIColor: any;
declare const NSTextAlignmentCenter: any;
declare const UIApplication: any;
declare const UIFont: any;

/**
 * Simple cross-platform toast utility.
 * - Android: Uses native android.widget.Toast
 * - iOS: Uses a custom UIView overlay
 */
export class Toast {
    private static iosToastView: any = null;

    /**
     * Show a toast message
     * @param message The message to display
     * @param duration Duration in milliseconds (default: 2000ms)
     */
    static show(message: string, duration: number = 2000): void {
        if (isAndroid) {
            Toast.showAndroid(message, duration);
        } else if (isIOS) {
            Toast.showIOS(message, duration);
        }
    }

    private static showAndroid(message: string, duration: number): void {
        console.log('Toast.showAndroid called with message:', message);
        try {
            const context = application.android.context ||
                application.android.foregroundActivity ||
                application.android.startActivity;

            console.log('Toast: Android context =', context ? 'exists' : 'null');

            if (context) {
                const toastDuration = duration >= 3000
                    ? android.widget.Toast.LENGTH_LONG
                    : android.widget.Toast.LENGTH_SHORT;

                android.widget.Toast.makeText(context, message, toastDuration).show();
                console.log('Toast: Android toast shown');
            } else {
                console.warn('Toast: No Android context available');
            }
        } catch (e) {
            console.error('Toast Android error:', e);
        }
    }

    private static showIOS(message: string, duration: number): void {
        console.log('Toast.showIOS called with message:', message);
        try {
            // Remove existing toast if any
            if (Toast.iosToastView) {
                Toast.iosToastView.removeFromSuperview();
                Toast.iosToastView = null;
            }

            // Get the key window
            const app = UIApplication.sharedApplication;
            console.log('Toast: Got UIApplication.sharedApplication');

            const window = app.keyWindow || (app.windows.count > 0 ? app.windows.objectAtIndex(0) : null);
            console.log('Toast: window =', window);

            if (!window) {
                console.warn('Toast: No window available');
                return;
            }

            // Get screen dimensions in POINTS (not pixels!)
            // UIKit uses points, not pixels
            const screenBounds = window.bounds;
            const screenWidth = screenBounds.size.width;
            const screenHeight = screenBounds.size.height;

            console.log('Toast: screenWidth =', screenWidth, 'screenHeight =', screenHeight);

            // Create toast container - use POINTS not pixels
            const toastWidth = Math.min(screenWidth - 40, 300);
            const toastHeight = 44;
            const toastX = (screenWidth - toastWidth) / 2;
            const toastY = screenHeight - toastHeight - 100; // 100pt from bottom

            console.log('Toast: creating view at x=', toastX, 'y=', toastY, 'w=', toastWidth, 'h=', toastHeight);

            const toastView = UIView.alloc().initWithFrame(
                CGRectMake(toastX, toastY, toastWidth, toastHeight)
            );

            // Style the toast
            toastView.backgroundColor = UIColor.colorWithRedGreenBlueAlpha(0, 0, 0, 0.8);
            toastView.layer.cornerRadius = 10;
            toastView.clipsToBounds = true;
            toastView.alpha = 1; // Start visible immediately for debugging

            // Create label
            const label = UILabel.alloc().initWithFrame(
                CGRectMake(10, 0, toastWidth - 20, toastHeight)
            );
            label.text = message;
            label.textColor = UIColor.whiteColor;
            label.textAlignment = NSTextAlignmentCenter;
            label.numberOfLines = 2;
            label.font = UIFont.systemFontOfSize(14);

            toastView.addSubview(label);
            window.addSubview(toastView);

            Toast.iosToastView = toastView;

            console.log('Toast: view added to window');

            // Animate out after duration using setTimeout
            setTimeout(() => {
                console.log('Toast: starting fade out');
                UIView.animateWithDurationAnimations(0.3, () => {
                    toastView.alpha = 0;
                });

                // Remove after animation completes
                setTimeout(() => {
                    toastView.removeFromSuperview();
                    if (Toast.iosToastView === toastView) {
                        Toast.iosToastView = null;
                    }
                    console.log('Toast: removed from window');
                }, 300);
            }, duration);
        } catch (e) {
            console.error('Toast iOS error:', e);
        }
    }
}
