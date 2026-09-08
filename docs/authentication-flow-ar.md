# تحديثات تدفق المصادقة (Authentication Flow)

## ملخص سريع

تم تحديث تسجيل الدخول في تطبيق الجوال ليعتمد على تشفير بيانات الدخول + التحقق الثنائي عبر رمز OTP قبل إصدار التوكن.

---

## النقاط الرئيسية للتنفيذ

### 1) تسجيل الدخول الآمن (مشفّر)

- لم يعد التطبيق يرسل اسم المستخدم/كلمة المرور كنص واضح.
- يتم تشفير بيانات الدخول باستخدام **AES-CBC**.
- يتم الإرسال إلى:
  - `POST /api/Account/login/secure`
- شكل جسم الطلب:

```json
{
  "Data": "<base64_encrypted_payload>"
}
```

- البيانات المشفّرة تحتوي على:
  - `usernameOrEmail`
  - `password`
  - `countryCode`
  - `rememberme`

### 2) التحقق الإلزامي عبر OTP (المصادقة الثنائية)

- عند نجاح تسجيل الدخول الآمن بدون إرجاع `access_token`، يتم توجيه المستخدم إلى شاشة **التحقق من رمز OTP**.
- يتم التحقق عبر:
  - `POST /api/Account/validateOtp`
- شكل جسم الطلب:

```json
{
  "emailOrNationalId": "<usernameOrEmail>",
  "code": "<6_digit_otp>"
}
```



### 3) إصدار التوكن بعد نجاح OTP فقط

- يتم إرجاع توكن الدخول (`extraData.access_token`) بعد نجاح التحقق من OTP.
- يتم حفظ التوكن بشكل آمن على الجهاز.
- يُستخدم لاحقًا في الطلبات عبر:
  - `Authorization: Bearer <access_token>`



### 4) إعادة إرسال OTP مع مؤقت الانتظار

- إعادة الإرسال:
  - `POST /api/Account/resendOtp`

```json
{
  "emailOrNationalId": "<usernameOrEmail>"
}
```

- مؤقت إعادة الإرسال:
  - `GET /api/Account/hideresendotpbutton`
- يعتمد على قيمة `expiryTimer` (بالدقائق) للتحكم في تفعيل زر إعادة الإرسال.



### 5) واجهة OTP في الجوال

- إدخال رمز مكوّن من **6 خانات**.
- الانتقال التلقائي إلى الخانة التالية عند إدخال الرقم.
- تفعيل زر تسجيل الدخول فقط بعد اكتمال الـ 6 أرقام.
- عرض مؤقت العد التنازلي مع زر إعادة الإرسال.



### 6) معالجة أكواد الأخطاء

- `WrongUsernameOrPassword`
- `AccountLocked`
- `LoginWithIam`
- `InvalidModel`
- `InvalidOTP`
- `ExpiryOTPCode`



## التدفق الكامل (End-to-End)

1. المستخدم يدخل بيانات الدخول
2. تشفير البيانات بـ AES
3. استدعاء `login/secure`
4. فتح شاشة OTP
5. استدعاء `validateOtp`
6. حفظ التوكن
7. الدخول إلى التطبيق

---

