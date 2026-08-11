import { TestBed, inject } from '@angular/core/testing';

import { RegisterConfirmComponent } from './register-confirm.component';

describe('a register-confirm component', () => {
	let component: RegisterConfirmComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				RegisterConfirmComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([RegisterConfirmComponent], (RegisterConfirmComponent) => {
		component = RegisterConfirmComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});