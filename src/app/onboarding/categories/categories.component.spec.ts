import { TestBed, inject } from '@angular/core/testing';

import { CategoriesComponent } from './categories.component';

describe('a categories component', () => {
	let component: CategoriesComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CategoriesComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CategoriesComponent], (CategoriesComponent) => {
		component = CategoriesComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});