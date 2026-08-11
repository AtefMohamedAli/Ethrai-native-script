import { TestBed, inject } from '@angular/core/testing';

import { DownloadSettingsComponent } from './download-settings.component';

describe('a download-settings component', () => {
	let component: DownloadSettingsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DownloadSettingsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DownloadSettingsComponent], (DownloadSettingsComponent) => {
		component = DownloadSettingsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});