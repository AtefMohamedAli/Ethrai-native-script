import { TestBed, inject } from '@angular/core/testing';

import { CertificatesComponent } from './certificates.component';

describe('a certificates component', () => {
	let component: CertificatesComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CertificatesComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CertificatesComponent], (CertificatesComponent) => {
		component = CertificatesComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});