export interface WeatherApiResponse {
  location: Location;
  current: Current;
  forecast: Forecast;
}

export interface Location {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime_epoch: number;
  localtime: string;
}

export interface Current {
  temp_c: number;
  condition: Condition;
  wind_kph: number;
  humidity: number;
}

export interface Condition {
  text: string;
  icon: string;
  code: number;
}

export interface Forecast {
  forecastday: Forecastday[];
}

export interface Forecastday {
  date: string;
  day: Day;
}

export interface Day {
  avgtemp_c: number;
  maxwind_kph: number;
  avghumidity: number;
  condition: Condition;
}