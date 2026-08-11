import { TestBed, inject } from '@angular/core/testing';

import { BookmarksComponent } from './bookmarks.component';

describe('a bookmarks component', () => {
	let component: BookmarksComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				BookmarksComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([BookmarksComponent], (BookmarksComponent) => {
		component = BookmarksComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});