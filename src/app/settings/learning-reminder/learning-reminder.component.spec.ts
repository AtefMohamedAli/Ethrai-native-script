import { TestBed, inject } from '@angular/core/testing';

import { LearningReminderComponent } from './learning-reminder.component';

describe('a learning-reminder component', () => {
	let component: LearningReminderComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				LearningReminderComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([LearningReminderComponent], (LearningReminderComponent) => {
		component = LearningReminderComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});