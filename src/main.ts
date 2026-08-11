import { platformNativeScript, runNativeScriptAngularApp } from '@nativescript/angular';
import '@angular/compiler';
import { AppModule } from './app/app.module'
import { registerElement } from '@nativescript/angular';
import { ModalStack, overrideModalViewMethod } from 'nativescript-windowed-modal';
overrideModalViewMethod()
registerElement("ModalStack", () => ModalStack)

runNativeScriptAngularApp({
  appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
