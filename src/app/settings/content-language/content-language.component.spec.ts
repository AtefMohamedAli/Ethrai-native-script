import { TestBed, inject } from '@angular/core/testing';

import { ContentLanguageComponent } from './content-language.component';

describe('a content-language component', () => {
	let component: ContentLanguageComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ContentLanguageComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ContentLanguageComponent], (ContentLanguageComponent) => {
		component = ContentLanguageComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});