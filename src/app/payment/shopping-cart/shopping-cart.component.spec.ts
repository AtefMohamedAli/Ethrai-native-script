import { TestBed, inject } from '@angular/core/testing';

import { ShoppingCartComponent } from './shopping-cart.component';

describe('a shopping-cart component', () => {
	let component: ShoppingCartComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ShoppingCartComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ShoppingCartComponent], (ShoppingCartComponent) => {
		component = ShoppingCartComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});