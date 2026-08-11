import { TestBed, inject } from '@angular/core/testing';

import { CasesStudyComponent } from './cases-study.component';

describe('a cases-study component', () => {
	let component: CasesStudyComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CasesStudyComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CasesStudyComponent], (CasesStudyComponent) => {
		component = CasesStudyComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});