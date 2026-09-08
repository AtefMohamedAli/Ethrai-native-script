import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Logs every HTTP request/response while environment.enableApiLogs is true.
 * View output in the `ns run android` terminal or via:
 *   adb logcat -s JS:V chromium:V
 */
@Injectable()
export class ApiLoggingInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!environment.enableApiLogs) {
            return next.handle(req);
        }

        const started = Date.now();
        const headers: Record<string, string> = {};
        req.headers.keys().forEach(key => {
            headers[key] = req.headers.get(key) || '';
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`➡️  API REQUEST  ${req.method}  ${req.urlWithParams}`);
        console.log('📋 Headers:', JSON.stringify(headers, null, 2));
        if (req.body !== null && req.body !== undefined) {
            console.log('📦 Body:', this.stringifyBody(req.body));
        }

        return next.handle(req).pipe(
            tap({
                next: (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        const ms = Date.now() - started;
                        console.log(`⬅️  API RESPONSE ${event.status}  ${req.method}  ${req.urlWithParams}  (${ms}ms)`);
                        console.log('📥 Response:', this.stringifyBody(event.body));
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    }
                },
                error: (error: HttpErrorResponse) => {
                    const ms = Date.now() - started;
                    console.log(`❌ API ERROR ${error.status || 'NETWORK'}  ${req.method}  ${req.urlWithParams}  (${ms}ms)`);
                    console.log('📥 Error body:', this.stringifyBody(error.error));
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                }
            })
        );
    }

    private stringifyBody(body: any): string {
        if (body === null || body === undefined) {
            return String(body);
        }
        if (typeof body === 'string') {
            return body;
        }
        try {
            return JSON.stringify(body, null, 2);
        } catch {
            return String(body);
        }
    }
}
