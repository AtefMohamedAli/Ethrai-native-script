import { TestBed, inject } from '@angular/core/testing';

import { KnowledgeComponent } from './knowledge.component';

describe('a Knowledge component', () => {
	let component: KnowledgeComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				KnowledgeComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([KnowledgeComponent], (KnowledgeComponent) => {
		component = KnowledgeComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});