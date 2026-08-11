import { TestBed, inject } from '@angular/core/testing';

import { VideoSettingsComponent } from './video-settings.component';

describe('a video-settings component', () => {
	let component: VideoSettingsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				VideoSettingsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([VideoSettingsComponent], (VideoSettingsComponent) => {
		component = VideoSettingsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});