import { TestBed, inject } from '@angular/core/testing';

import { SplashScreenComponent } from './splash-screen.component';

describe('a splash-screen component', () => {
	let component: SplashScreenComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				SplashScreenComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([SplashScreenComponent], (SplashScreenComponent) => {
		component = SplashScreenComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});