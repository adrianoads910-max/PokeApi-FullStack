import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let component: AuthInterceptor;
  let fixture: ComponentFixture<AuthInterceptor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthInterceptor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthInterceptor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
