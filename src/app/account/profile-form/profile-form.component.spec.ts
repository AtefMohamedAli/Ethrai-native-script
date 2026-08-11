import { TestBed, inject } from '@angular/core/testing';

import { ProfileFormComponent } from './profile-form.component';

describe('a profile-form component', () => {
	let component: ProfileFormComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ProfileFormComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ProfileFormComponent], (ProfileFormComponent) => {
		component = ProfileFormComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});