import { TestBed, inject } from '@angular/core/testing';

import { FinishingConfirmComponent } from './finishing-confirm.component';

describe('a finishing-confirm component', () => {
	let component: FinishingConfirmComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				FinishingConfirmComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([FinishingConfirmComponent], (FinishingConfirmComponent) => {
		component = FinishingConfirmComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});