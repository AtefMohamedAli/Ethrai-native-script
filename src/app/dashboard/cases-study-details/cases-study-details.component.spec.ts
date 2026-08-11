import { TestBed, inject } from '@angular/core/testing';

import { CasesStudyDetailsComponent } from './cases-study-details.component';

describe('a cases-study-details component', () => {
	let component: CasesStudyDetailsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CasesStudyDetailsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CasesStudyDetailsComponent], (CasesStudyDetailsComponent) => {
		component = CasesStudyDetailsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});