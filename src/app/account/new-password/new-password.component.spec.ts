import { TestBed, inject } from '@angular/core/testing';

import { NewPasswordComponent } from './new-password.component';

describe('a new-password component', () => {
	let component: NewPasswordComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				NewPasswordComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([NewPasswordComponent], (NewPasswordComponent) => {
		component = NewPasswordComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});