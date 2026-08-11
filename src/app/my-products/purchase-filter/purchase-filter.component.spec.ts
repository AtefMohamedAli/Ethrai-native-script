import { TestBed, inject } from '@angular/core/testing';

import { PurchaseFilterComponent } from './purchase-filter.component';

describe('a purchase-filter component', () => {
	let component: PurchaseFilterComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PurchaseFilterComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([PurchaseFilterComponent], (PurchaseFilterComponent) => {
		component = PurchaseFilterComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});