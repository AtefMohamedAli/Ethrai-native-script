import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'sa.ethrai-mobile.app',
  appPath: 'src',
  appResourcesPath: 'App_Resources',
  android: {
    id: 'sa.ethrai_mobile.app',
    v8Flags: '--expose_gc',
    markingMode: 'none',
    discardUncaughtJsExceptions: true,
    codeCache: true
  }
} as NativeScriptConfig;