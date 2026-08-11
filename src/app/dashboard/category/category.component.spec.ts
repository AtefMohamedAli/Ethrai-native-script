import { TestBed, inject } from '@angular/core/testing';

import { CategoryComponent } from './category.component';

describe('a category component', () => {
	let component: CategoryComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CategoryComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CategoryComponent], (CategoryComponent) => {
		component = CategoryComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});