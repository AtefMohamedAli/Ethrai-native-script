import { TestBed, inject } from '@angular/core/testing';

import { ForgotPasswordComponent } from './forgot-password.component';

describe('a forgot-password component', () => {
	let component: ForgotPasswordComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ForgotPasswordComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ForgotPasswordComponent], (ForgotPasswordComponent) => {
		component = ForgotPasswordComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});