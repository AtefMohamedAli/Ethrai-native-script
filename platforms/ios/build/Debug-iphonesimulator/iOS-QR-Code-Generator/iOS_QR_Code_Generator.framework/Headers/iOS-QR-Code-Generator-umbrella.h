#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "CIColor+QRCode.h"
#import "NSString+Utils.h"
#import "QRCodeGenerator.h"

FOUNDATION_EXPORT double iOS_QR_Code_GeneratorVersionNumber;
FOUNDATION_EXPORT const unsigned char iOS_QR_Code_GeneratorVersionString[];

