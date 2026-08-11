import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Page } from '@nativescript/core';
import { ModalDialogService } from '@nativescript/angular';
import { of } from 'rxjs';

import { AboutEthraiComponent } from './about-ethrai.component';
import { SettingsService } from '../settings.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

describe('AboutEthraiComponent', () => {
	let component: AboutEthraiComponent;

	// Mock services
	const mockPage = {};

	const mockSettingsService = {
		getAboutContent: jasmine.createSpy('getAboutContent').and.returnValue(of([]))
	};

	const mockModalDialogService = {
		showModal: jasmine.createSpy('showModal')
	};

	const mockGlobalService = {
		isLoggedIn: false,
		isEthrai: true,
		getUserStats: jasmine.createSpy('getUserStats').and.returnValue(null),
		getUserProfile: jasmine.createSpy('getUserProfile').and.returnValue(null)
	};

	const mockFirebaseEventService = {
		logScreenViewedEvent: jasmine.createSpy('logScreenViewedEvent')
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [AboutEthraiComponent],
			providers: [
				{ provide: Page, useValue: mockPage },
				{ provide: SettingsService, useValue: mockSettingsService },
				{ provide: ModalDialogService, useValue: mockModalDialogService },
				{ provide: GlobalService, useValue: mockGlobalService },
				{ provide: FirebaseEventService, useValue: mockFirebaseEventService }
			],
			schemas: [NO_ERRORS_SCHEMA]
		});

		const fixture = TestBed.createComponent(AboutEthraiComponent);
		component = fixture.componentInstance;
	});

	it('should create the component', () => {
		expect(component).toBeDefined();
	});

	it('should call getAboutContent on init', () => {
		component.ngOnInit();
		expect(mockSettingsService.getAboutContent).toHaveBeenCalled();
	});

	it('should strip HTML tags from text', () => {
		const html = '<p>Hello</p><span>World</span>';
		const result = component.getText(html);
		expect(result).not.toContain('<p>');
		expect(result).not.toContain('</p>');
	});

	it('should open modal with correct type', () => {
		component.openModal('terms');
		expect(mockModalDialogService.showModal).toHaveBeenCalled();
	});
});