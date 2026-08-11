import { TestBed, inject } from '@angular/core/testing';

import { ProductFeedbackComponent } from './product-feedback.component';

describe('a product-feedback component', () => {
	let component: ProductFeedbackComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ProductFeedbackComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ProductFeedbackComponent], (ProductFeedbackComponent) => {
		component = ProductFeedbackComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});