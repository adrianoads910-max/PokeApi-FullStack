import { TestBed } from '@angular/core/testing';
import { Register } from './register';

describe('Register Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Register],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
