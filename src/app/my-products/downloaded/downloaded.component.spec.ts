import { TestBed, inject } from '@angular/core/testing';

import { DownloadedComponent } from './downloaded.component';

describe('a downloaded component', () => {
	let component: DownloadedComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DownloadedComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DownloadedComponent], (DownloadedComponent) => {
		component = DownloadedComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});