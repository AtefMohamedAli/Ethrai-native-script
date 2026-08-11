import { TestBed, inject } from '@angular/core/testing';

import { TabNavigationComponent } from './tab-navigation.component';

describe('a tab-navigation component', () => {
	let component: TabNavigationComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TabNavigationComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TabNavigationComponent], (TabNavigationComponent) => {
		component = TabNavigationComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});