import { TestBed, inject } from '@angular/core/testing';

import { OnlineClassesComponent } from './online-classes.component';

describe('a online-classes component', () => {
	let component: OnlineClassesComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OnlineClassesComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([OnlineClassesComponent], (OnlineClassesComponent) => {
		component = OnlineClassesComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});