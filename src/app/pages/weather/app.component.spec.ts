import { TestBed } from '@angular/core/testing';
import { WeatherComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WeatherComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherComponent, HttpClientTestingModule, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(WeatherComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});