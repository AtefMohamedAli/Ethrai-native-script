import { TestBed, inject } from '@angular/core/testing';

import { OtpVerificationComponent } from './otp-verification.component';

describe('an otp-verification component', () => {
	let component: OtpVerificationComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OtpVerificationComponent
			]
		});
	});

	beforeEach(inject([OtpVerificationComponent], (OtpVerificationComponent) => {
		component = OtpVerificationComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});
