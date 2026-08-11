import { TestBed, inject } from '@angular/core/testing';

import { HelpCenterComponent } from './help-center.component';

describe('a help-center component', () => {
	let component: HelpCenterComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				HelpCenterComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([HelpCenterComponent], (HelpCenterComponent) => {
		component = HelpCenterComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});