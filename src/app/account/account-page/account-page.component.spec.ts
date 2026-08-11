import { TestBed, inject } from '@angular/core/testing';

import { AccountPageComponent } from './account-page.component';

describe('a account-page component', () => {
	let component: AccountPageComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AccountPageComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([AccountPageComponent], (AccountPageComponent) => {
		component = AccountPageComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});