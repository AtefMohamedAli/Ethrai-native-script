import { TestBed, inject } from '@angular/core/testing';

import { PurchasesComponent } from './purchases.component';

describe('a purchases component', () => {
	let component: PurchasesComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PurchasesComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([PurchasesComponent], (PurchasesComponent) => {
		component = PurchasesComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});