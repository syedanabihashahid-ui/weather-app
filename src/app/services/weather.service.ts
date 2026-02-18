import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey: string = 'bad3a251133644279cb74950260202';
  private baseUrl: string = 'https://api.weatherapi.com/v1';

  constructor(private http: HttpClient) {}

  getLocationAutocomplete(query: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search.json?key=${this.apiKey}&q=${query}`);
  }

  getForecastByCity(city: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${city}&days=10&aqi=no&alerts=no`);
  }

  getForecastByCoordinates(lat: number, lon: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${lat},${lon}&days=10&aqi=no&alerts=no`);
  }

  getHistoryByCity(city: string, date: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/history.json?key=${this.apiKey}&q=${city}&dt=${date}`);
  }

  getHistoryByCoordinates(lat: number, lon: number, date: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/history.json?key=${this.apiKey}&q=${lat},${lon}&dt=${date}`);
  }
}


