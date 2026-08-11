import { TestBed, inject } from '@angular/core/testing';

import { ChooseAccountComponent } from './choose-account.component';

describe('a choose-account component', () => {
	let component: ChooseAccountComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ChooseAccountComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ChooseAccountComponent], (ChooseAccountComponent) => {
		component = ChooseAccountComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});