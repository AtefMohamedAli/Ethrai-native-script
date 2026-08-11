import { TestBed, inject } from '@angular/core/testing';

import { CheckoutComponent } from './checkout.component';

describe('a checkout component', () => {
	let component: CheckoutComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CheckoutComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CheckoutComponent], (CheckoutComponent) => {
		component = CheckoutComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});