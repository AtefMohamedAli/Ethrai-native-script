import { TestBed, inject } from '@angular/core/testing';

import { LoginByMailComponent } from './login-by-mail.component';

describe('a login-by-mail component', () => {
	let component: LoginByMailComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				LoginByMailComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([LoginByMailComponent], (LoginByMailComponent) => {
		component = LoginByMailComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});