import { TestBed, inject } from '@angular/core/testing';

import { NotificationsComponent } from './notifications.component';

describe('a notifications component', () => {
	let component: NotificationsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				NotificationsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([NotificationsComponent], (NotificationsComponent) => {
		component = NotificationsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});