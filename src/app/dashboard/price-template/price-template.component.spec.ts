import { TestBed, inject } from '@angular/core/testing';

import { PriceTemplateComponent } from './price-template.component';

describe('a price-template component', () => {
	let component: PriceTemplateComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PriceTemplateComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([PriceTemplateComponent], (PriceTemplateComponent) => {
		component = PriceTemplateComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});