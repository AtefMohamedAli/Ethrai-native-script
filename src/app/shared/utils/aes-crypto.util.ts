import * as CryptoJS from 'crypto-js';

const AES_KEY = '2adf0520450f4f24bb2054e8371a9bb9';
const AES_IV = 'edf2e1b04f7946a4';

/**
 * Encrypt a UTF-8 string with AES-CBC + PKCS7, returning a Base64 ciphertext.
 */
export function encryptAesCbcToBase64(plainText: string): string {
    const key = CryptoJS.enc.Utf8.parse(AES_KEY);
    const iv = CryptoJS.enc.Utf8.parse(AES_IV);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

/**
 * Serialize any object to JSON, encrypt it, and wrap as { Data: "<base64>" }.
 */
export function buildSecureDataPayload(data: Record<string, any>): { Data: string } {
    return { Data: encryptAesCbcToBase64(JSON.stringify(data)) };
}

/**
 * Serialize login credentials and wrap them in the secure login payload shape.
 */
export function buildSecureLoginPayload(credentials: {
    usernameOrEmail: string;
    password: string;
    countryCode?: string;
    rememberme?: boolean;
}): { Data: string } {
    return buildSecureDataPayload({
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password,
        countryCode: credentials.countryCode || '',
        rememberme: !!credentials.rememberme
    });
}
