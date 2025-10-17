import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Equip } from './equip';

describe('Equip', () => {
  let component: Equip;
  let fixture: ComponentFixture<Equip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Equip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Equip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
