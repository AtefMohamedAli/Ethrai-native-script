import { TestBed, inject } from '@angular/core/testing';

import { FavoritesComponent } from './favorites.component';

describe('a favorites component', () => {
	let component: FavoritesComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				FavoritesComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([FavoritesComponent], (FavoritesComponent) => {
		component = FavoritesComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});