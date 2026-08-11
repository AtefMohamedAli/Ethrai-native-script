import { TestBed, inject } from '@angular/core/testing';

import { ChangePasswordComponent } from './change-password.component';

describe('a change-password component', () => {
	let component: ChangePasswordComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ChangePasswordComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ChangePasswordComponent], (ChangePasswordComponent) => {
		component = ChangePasswordComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});