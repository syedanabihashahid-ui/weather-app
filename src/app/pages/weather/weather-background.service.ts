import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherBackgroundService {
  private videoSource = new BehaviorSubject<string>('assets/videos/sunny.mp4');
  videoUrl$ = this.videoSource.asObservable();
 
  setVideoBackground(description: string): void {
    const desc = description.toLowerCase();
    const hour = new Date().getHours();

    // Night (7pm - 6am)
    if (hour >= 19 || hour <= 6) {
      this.videoSource.next('assets/videos/night.mp4');
      return;
    }

    if (desc.includes('cyclone') || desc.includes('hurricane')) {
      this.videoSource.next('assets/videos/cyclones.mp4');
    } else if (desc.includes('fog') || desc.includes('mist')) {
      this.videoSource.next('assets/videos/mist fog.mp4');
    } else if (desc.includes('wind') || desc.includes('breezy')) {
      this.videoSource.next('assets/videos/wind.mp4');
    } else if (desc.includes('rainbow')) {
      this.videoSource.next('assets/videos/rainbow.mp4');
    } else if (desc.includes('storm')) {
      this.videoSource.next('assets/videos/stormy.mp4');
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      this.videoSource.next('assets/videos/rainy.mp4');
    } else if (desc.includes('snow')) {
      this.videoSource.next('assets/videos/snow.mp4');
    } else if (desc.includes('cloud') || desc.includes('overcast')) {
      this.videoSource.next('assets/videos/cloud.mp4');
    } else if (desc.includes('thunder')) {
      this.videoSource.next('assets/videos/thunder.mp4');
    } else if (desc.includes('clear')) {
      this.videoSource.next('assets/videos/clear.mp4');
    } else {
      this.videoSource.next('assets/videos/sunny.mp4');
    }
  }
}
