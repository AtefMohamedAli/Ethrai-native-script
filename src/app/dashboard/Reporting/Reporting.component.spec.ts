import { TestBed, inject } from '@angular/core/testing';

import { ReportingComponent } from './Reporting.component';

describe('a Reporting component', () => {
	let component: ReportingComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ReportingComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ReportingComponent], (ReportingComponent) => {
		component = ReportingComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});