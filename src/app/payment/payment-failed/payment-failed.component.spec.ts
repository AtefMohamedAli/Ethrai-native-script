import { TestBed, inject } from '@angular/core/testing';

import { PaymentFailedComponent } from './payment-failed.component';

describe('a payment-failed component', () => {
	let component: PaymentFailedComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PaymentFailedComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([PaymentFailedComponent], (PaymentFailedComponent) => {
		component = PaymentFailedComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});