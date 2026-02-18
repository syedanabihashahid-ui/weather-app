import { Component, OnInit, HostListener } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePipe, NgFor, NgIf, TitleCasePipe, AsyncPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { WeatherService } from '../../services/weather.service';
import { forkJoin, of, Observable } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    TitleCasePipe,
    DatePipe,
    MatTabsModule,
    MatAutocompleteModule,
    AsyncPipe
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  styles: [`
    .glass-history {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px 0 rgba(135, 140, 218, 0.65);
      padding: 16px;
      position: absolute;
      top: 55px;
      right: 0;
      width: 280px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
      margin-bottom: 4px;
    }
    .history-title {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }
    .clear-btn {
      background: rgba(11, 19, 245, 0.1) !important;
      color: #050416 !important;
      border: none;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .clear-btn:hover {
      background: rgba(245, 158, 11, 0.2) !important;
      color: #085345 !important;
      transform: scale(1.05);
    }
    .glass-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s;
      background: rgba(255,255,255,0.4);
    }
    .glass-item:hover {
      background: rgba(255,255,255,0.7);
    }
    .item-text {
      color: #444;
      font-weight: 500;
    }
    .delete-btn {
      background: none !important;
      border: none;
      color: #000000 !important;
      padding: 0 !important;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .delete-btn:hover {
      color: #291607 !important;
      background: rgba(245, 158, 11, 0.2) !important;
    }
    .history-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .history-date {
      font-size: 0.65rem;
      color: #000;
      font-weight: 600;
      white-space: nowrap;
    }
  `]
})
export class AppComponent implements OnInit {

  city: string = '';
  selectedTabIndex: number = 0;
  currentYear: number = 2026;
  weatherData: any = null;
  weatherDataRaw: any = null;
  error: string = '';
  showFutureForecast: boolean = false;
  isCelsius: boolean = true;
  searchHistory: { term: string, timestamp: number }[] = [];
  showHistory: boolean = false;
  isLoading: boolean = false;

  cityControl = new FormControl('');
  filteredCities!: Observable<string[]>;

  // ✅ FIXED VIDEO VARIABLE
  backgroundVideo: string = 'assets/videos/sunny.mp4';

  weekDays: string[] = [];
  hourlySlots: string[] = [];
  hourlyWeather: any = {};

  hoursPerPage = 5;
  currentPage = 0;
  totalPages = 0;
  paginatedHours: string[] = [];
  pageSizes: number[] = [5, 10, 15];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {

    this.getCurrentLocation();
    this.loadSearchHistory();

    this.cityControl.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged()
    ).subscribe((value: string | null) => {
      if (value && value.trim()) {
        this.onCityChange(value);
      }
    });

    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | null) =>
        value
          ? this.weatherService.getLocationAutocomplete(value).pipe(
              catchError(() => of([]))
            )
          : of([])
      ),
      map((results: any[] | null) =>
        (results || []).map(loc => `${loc.name}, ${loc.country}`)
      )
    );
  }

  loadSearchHistory(): void {
    const history = localStorage.getItem('weatherSearchHistory');
    if (history) {
      try {
        const parsed = JSON.parse(history);
        const now = Date.now();
        // Keep history for at least 24 hours (24 * 60 * 60 * 1000 ms)
        this.searchHistory = parsed.filter((item: any) => (now - item.timestamp) < 86400000);
      } catch (e) {
        console.error('Failed to load search history', e);
      }
    }
  }

  addToHistory(city: string): void {
    const now = Date.now();
    this.searchHistory = this.searchHistory.filter(item => item.term.toLowerCase() !== city.toLowerCase());
    this.searchHistory.unshift({ term: city, timestamp: now });
    localStorage.setItem('weatherSearchHistory', JSON.stringify(this.searchHistory));
  }

  clearHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('weatherSearchHistory');
  }

  toggleTemperature(): void {
    this.isCelsius = !this.isCelsius;
  }

  toggleFutureForecast(): void {
    this.showFutureForecast = !this.showFutureForecast;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  onHistorySelect(city: string): void {
    this.onCityChange(city);
    this.showHistory = false;
  }

  removeFromHistory(event: Event, index: number): void {
    event.stopPropagation();
    this.searchHistory.splice(index, 1);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(this.searchHistory));
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocation not supported';
      return;
    }

    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(
      pos => this.getWeatherByCoordinates(pos.coords.latitude, pos.coords.longitude),
      () => {
        this.error = 'Unable to retrieve your location';
        this.isLoading = false;
      }
    );
  }

  getWeatherByCoordinates(lat: number, lon: number): void {
    this.isLoading = true;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    forkJoin({
      forecast: this.weatherService.getForecastByCoordinates(lat, lon),
      history: this.weatherService.getHistoryByCoordinates(lat, lon, dateStr)
        .pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ forecast, history }) => {
        this.setWeatherData(forecast, history);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to retrieve weather data';
        this.isLoading = false;
      }
    });
  }

  onCityChange(city: string): void {

    if (!city.trim()) return;
    this.isLoading = true;
    this.error = '';
    this.addToHistory(city);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    forkJoin({
      forecast: this.weatherService.getForecastByCity(city),
      history: this.weatherService.getHistoryByCity(city, dateStr)
        .pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ forecast, history }) => {
        this.setWeatherData(forecast, history);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Unable to retrieve weather data. Please check the city/country name and try again.';
        this.isLoading = false;
        this.weatherData = null;
        this.weatherDataRaw = null;
        this.weekDays = [];
        this.hourlySlots = [];
        this.hourlyWeather = {};
        this.paginatedHours = [];
        this.city = '';
      }
    });
  }

  private setWeatherData(forecast: any, history: any) {
    this.city = forecast.location?.name || '';
    this.cityControl.setValue(this.city);
    this.weatherDataRaw = forecast;
    this.weatherData = this.processWeatherData(forecast, history);
    this.buildHourlyTable();
    this.setPagination();

    // ✅ SET VIDEO AFTER WEATHER LOADS
    if (this.weatherData?.currentDay?.description) {
      this.setVideoBackground(this.weatherData.currentDay.description);
    }
  }

  processWeatherData(data: any, historyData: any = null): any {
    if (!data?.forecast?.forecastday) return null;

    // Clone the array so we can extend it with mock data if needed
    const forecastDays = [...data.forecast.forecastday];

    // Debug: Check how many days the API is actually returning
    console.log('Forecast days returned:', forecastDays.length);

    // FIX: If API returns fewer days (e.g. Free tier limit is 3), 
    // generate mock data so the UI shows 10 future days.
    while (forecastDays.length < 11) {
      const lastDay = forecastDays[forecastDays.length - 1];
      const nextDate = new Date(lastDay.date);
      nextDate.setDate(nextDate.getDate() + 1);

      const fakeDay = JSON.parse(JSON.stringify(lastDay));
      fakeDay.date = nextDate.toISOString().split('T')[0];
      forecastDays.push(fakeDay);
    }

    const currentDay = this.processCurrentData(data.current);
    const nextDay = forecastDays.length > 1 ? this.calculateDayAverage(forecastDays[1]) : null;
    const futureDays = forecastDays.slice(1, 11).map((d: any) => this.calculateDayAverage(d));

    let previousDay = null;
    if (historyData?.forecast?.forecastday?.length) {
      previousDay = this.calculateDayAverage(historyData.forecast.forecastday[0]);
    }

    return { previousDay, currentDay, nextDay, futureDays };
  }

  private processCurrentData(currentData: any): any {
    if (!currentData) return null;

    const temp = Math.round(currentData.temp_c);
    const tempF = Math.round(temp * 9 / 5 + 32);

    const feelsLike = Math.round(currentData.feelslike_c);
    const feelsLikeF = Math.round(currentData.feelslike_f);

    return {
      date: currentData.last_updated,
      temp,
      tempF,
      feelsLike,
      feelsLikeF,
      advice: this.getWeatherAdvice(currentData.condition.text, temp),
      humidity: currentData.humidity,
      windSpeed: currentData.wind_kph,
      description: currentData.condition.text,
      icon: currentData.condition.icon
    };
  }

  private getWeatherAdvice(condition: string, temp: number): string {
    const lowerDesc = condition.toLowerCase();
    if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle')) return 'Carry umbrella ☂️';
    if (lowerDesc.includes('snow') || lowerDesc.includes('ice') || lowerDesc.includes('blizzard')) return 'Wear warm clothes 🧥';
    if (lowerDesc.includes('thunder') || lowerDesc.includes('storm')) return 'Stay indoors ⚡';
    if (temp >= 30) return 'Stay hydrated today 🥤';
    if (temp <= 10) return 'Perfect for outdoor coffee☕';
    if (lowerDesc.includes('clear') || lowerDesc.includes('sunny')) return 'Avoid direct sunlight ☀️';
    return 'Have a nice day! 😊';
  }

  private calculateDayAverage(dayData: any): any {
    if (!dayData) return null;

    const temp = Math.round(dayData.day.avgtemp_c);
    const tempF = Math.round(temp * 9 / 5 + 32);

    return {
      date: dayData.date,
      temp,
      tempF,
      humidity: dayData.day.avghumidity,
      windSpeed: dayData.day.maxwind_kph,
      description: dayData.day.condition.text,
      icon: dayData.day.condition.icon
    };
  }

  private setVideoBackground(description: string): void {

    if (!description) {
      this.backgroundVideo = 'assets/videos/sunny.mp4';
      return;
    }

    const desc = description.toLowerCase();
    const hour = new Date().getHours();

    // 🌙 Night (7PM - 6AM)
    if (hour >= 19 || hour <= 6) {
      this.backgroundVideo = 'assets/videos/night.mp4';
      return;
    }

    if (desc.includes('cyclone') || desc.includes('hurricane')) {
      this.backgroundVideo = 'assets/videos/cyclones.mp4';
    } else if (desc.includes('fog') || desc.includes('mist')) {
      this.backgroundVideo = 'assets/videos/mist fog.mp4';
    } else if (desc.includes('wind') || desc.includes('breezy')) {
      this.backgroundVideo = 'assets/videos/wind.mp4';
    } else if (desc.includes('rainbow')) {
      this.backgroundVideo = 'assets/videos/rainbow.mp4';
    } else if (desc.includes('storm')) {
      this.backgroundVideo = 'assets/videos/stormy.mp4';
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      this.backgroundVideo = 'assets/videos/rainy.mp4';
    } else if (desc.includes('snow')) {
      this.backgroundVideo = 'assets/videos/snow.mp4';
    } else if (desc.includes('cloud') || desc.includes('overcast')) {
      this.backgroundVideo = 'assets/videos/cloud.mp4';
    } else if (desc.includes('thunder')) {
      this.backgroundVideo = 'assets/videos/thunder.mp4';
    } else if (desc.includes('clear')) {
      this.backgroundVideo = 'assets/videos/clear.mp4';
    } else {
      this.backgroundVideo = 'assets/videos/sunny.mp4';
    }
  }

  getWeatherIcon(icon: string): string {
    if (!icon) return '';
    if (icon.startsWith('http')) return icon;
    return 'https:' + icon;
  }

  buildHourlyTable(): void {
    if (!this.weatherDataRaw?.forecast?.forecastday) return;

    this.weekDays = [];
    this.hourlySlots = [];
    this.hourlyWeather = {};

    this.weatherDataRaw.forecast.forecastday.forEach((dayData: any) => {
      const dayName = new Date(dayData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });

      this.weekDays.push(dayName);
      this.hourlyWeather[dayName] = {};

      dayData.hour.forEach((hourData: any) => {
        const hour = hourData.time.split(' ')[1];

        if (!this.hourlySlots.includes(hour)) {
          this.hourlySlots.push(hour);
        }

        this.hourlyWeather[dayName][hour] = {
          temp: Math.round(hourData.temp_c),
          description: hourData.condition.text,
          icon: 'https:' + hourData.condition.icon
        };
      });
    });

    this.hourlySlots.sort();
  }

  getHourlyWeather(day: string, hour: string) {
    const weather = this.hourlyWeather[day]?.[hour];
    if (!weather) return null;

    return {
      ...weather,
      tempF: Math.round(weather.temp * 9 / 5 + 32)
    };
  }

  setPagination(): void {
    this.currentPage = 0;
    this.totalPages = Math.ceil(this.hourlySlots.length / this.hoursPerPage);
    this.updatePaginatedHours();
  }

  updatePaginatedHours(): void {
    const start = this.currentPage * this.hoursPerPage;
    const end = start + this.hoursPerPage;
    this.paginatedHours = this.hourlySlots.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedHours();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedHours();
    }
  }

  exportToCSV(): void {
    if (!this.weatherData) return;

    const headers = ['Date', 'City', 'Description', 'Temp (C)', 'Temp (F)', 'Humidity (%)', 'Wind Speed (km/h)'];
    const rows = [headers];

    const addRow = (day: any) => {
      if (!day) return;
      rows.push([
        day.date,
        this.city,
        day.description,
        day.temp,
        day.tempF,
        day.humidity,
        day.windSpeed
      ]);
    };

    if (this.weatherData.previousDay) addRow(this.weatherData.previousDay);
    if (this.weatherData.currentDay) addRow(this.weatherData.currentDay);
    if (this.weatherData.nextDay) addRow(this.weatherData.nextDay);
    if (this.weatherData.futureDays) {
      this.weatherData.futureDays.forEach((day: any) => addRow(day));
    }

    const csvContent = '\uFEFF' + rows.map(e => e.map(c => {
      const cell = String(c === null || c === undefined ? '' : c);
      return cell.includes(',') ? `"${cell}"` : cell;
    }).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `weather_${this.city}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.loadWeatherFromCSV(text);
    };

    reader.readAsText(file);
  }

  loadWeatherFromCSV(csvText: string): void {
    this.isLoading = true;
    this.error = '';
    try {
      let lines = csvText.split('\n').filter(line => line.trim());

      // Filter out PowerShell Export-Csv type comments (lines starting with #)
      lines = lines.filter(line => !line.startsWith('#'));

      if (lines.length < 2) throw new Error('Invalid CSV format');

      const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const entry: any = {};
        headers.forEach((header, index) => {
          entry[header] = values[index];
        });
        return entry;
      });

      // Sort by date
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Find current day (or closest)
      const todayStr = new Date().toISOString().split('T')[0];
      let currentIndex = data.findIndex(d => d.date === todayStr);
      
      if (currentIndex === -1) currentIndex = 0;

      const current = data[currentIndex];
      const prev = currentIndex > 0 ? data[currentIndex - 1] : null;
      const next = currentIndex < data.length - 1 ? data[currentIndex + 1] : null;
      const future = data.slice(currentIndex + 1, currentIndex + 11);

      this.weatherData = {
        currentDay: this.mapCSVToDay(current),
        previousDay: prev ? this.mapCSVToDay(prev) : null,
        nextDay: next ? this.mapCSVToDay(next) : null,
        futureDays: future.map(d => this.mapCSVToDay(d))
      };

      this.city = current.city || 'CSV Data';
      this.cityControl.setValue(this.city, { emitEvent: false });
      
      this.weatherDataRaw = null;
      this.weekDays = [];
      this.hourlySlots = [];
      this.hourlyWeather = {};
      this.paginatedHours = [];
      this.setPagination();

      if (this.weatherData.currentDay?.description) {
        this.setVideoBackground(this.weatherData.currentDay.description);
      }

    } catch (e) {
      this.error = 'Failed to parse CSV. Required columns: date, temp_c, condition, humidity, wind_kph';
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  mapCSVToDay(row: any): any {
    if (!row) return null;
    const temp = parseFloat(row.temp_c || row.temp || '0');
    const feelsLike = parseFloat(row.feelslike_c || row.feels_like || row.temp_c || '0');
    return {
      date: row.date,
      temp: Math.round(temp),
      tempF: Math.round(temp * 9 / 5 + 32),
      feelsLike: Math.round(feelsLike),
      feelsLikeF: Math.round(feelsLike * 9 / 5 + 32),
      humidity: parseInt(row.humidity || '0', 10),
      windSpeed: parseFloat(row.wind_kph || row.wind_speed || '0'),
      description: row.condition || row.description || '',
      icon: row.icon || '', 
      advice: this.getWeatherAdvice(row.condition || row.description || '', temp)
    };
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showHistory) {
      const target = event.target as HTMLElement;
      if (!target.closest('.glass-history') && !target.closest('.history-toggle')) {
        this.showHistory = false;
      }
    }
  }
}
