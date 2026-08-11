import { TestBed, inject } from '@angular/core/testing';

import { PaymentSuccessComponent } from './payment-success.component';

describe('a payment-success component', () => {
	let component: PaymentSuccessComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PaymentSuccessComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([PaymentSuccessComponent], (PaymentSuccessComponent) => {
		component = PaymentSuccessComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});