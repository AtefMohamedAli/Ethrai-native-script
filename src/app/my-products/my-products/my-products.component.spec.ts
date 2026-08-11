import { TestBed, inject } from '@angular/core/testing';

import { MyProductsComponent } from './my-products.component';

describe('a my-products component', () => {
	let component: MyProductsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MyProductsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([MyProductsComponent], (MyProductsComponent) => {
		component = MyProductsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});