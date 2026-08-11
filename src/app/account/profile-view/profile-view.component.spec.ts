import { TestBed, inject } from '@angular/core/testing';

import { ProfileViewComponent } from './profile-view.component';

describe('a profile-view component', () => {
	let component: ProfileViewComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ProfileViewComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ProfileViewComponent], (ProfileViewComponent) => {
		component = ProfileViewComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});