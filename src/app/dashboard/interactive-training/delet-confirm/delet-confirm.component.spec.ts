import { TestBed, inject } from '@angular/core/testing';

import { DeletConfirmComponent } from './delet-confirm.component';

describe('a delet-confirm component', () => {
	let component: DeletConfirmComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DeletConfirmComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DeletConfirmComponent], (DeletConfirmComponent) => {
		component = DeletConfirmComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});