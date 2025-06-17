import React from 'react';
import Lottie from 'lottie-react';
import { Wind, Droplets, Gauge, Eye, Sun, Cloud } from 'lucide-react';
import WeatherDetail from './WeatherDetail';

const WeatherDisplay = ({ weather, forecast, getWeatherLottie, formatTime }) => {
  if (!weather) return null;

  return (
    <div className="animate__animated animate__fadeIn">
      <h2 className="text-center text-dark fw-bold mb-3 display-6">
        {weather.name}, {weather.sys.country}
      </h2>

      <div className="text-center mb-4">
        <div className="d-flex justify-content-center">
          <Lottie
            animationData={getWeatherLottie(weather.weather[0].main)}
            style={{ width: 120, height: 120 }}
            loop
            autoplay
          />
        </div>
        <h3 className="mt-2 text-primary fw-bold display-4">{Math.round(weather.main.temp)}°C</h3>
        <p className="text-muted text-capitalize fs-4">{weather.weather[0].description}</p>
        <p className="text-secondary fs-5">Feels like {Math.round(weather.main.feels_like)}°C</p>
      </div>

      <div className="row g-4">
        <WeatherDetail icon={<Wind size={24} />} label="Wind" value={`${weather.wind.speed} m/s`} />
        <WeatherDetail icon={<Droplets size={24} />} label="Humidity" value={`${weather.main.humidity}%`} />
        <WeatherDetail icon={<Gauge size={24} />} label="Pressure" value={`${weather.main.pressure} hPa`} />
        <WeatherDetail icon={<Eye size={24} />} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
        <WeatherDetail icon={<Sun size={24} />} label="Sunrise" value={formatTime(weather.sys.sunrise, weather.timezone)} />
        <WeatherDetail icon={<Sun size={24} />} label="Sunset" value={formatTime(weather.sys.sunset, weather.timezone)} />
        <WeatherDetail icon={<Cloud size={24} />} label="Cloudiness" value={`${weather.clouds.all}%`} />
        <WeatherDetail icon={<Sun size={24} />} label="Min/Max" value={`${Math.round(weather.main.temp_min)}° / ${Math.round(weather.main.temp_max)}°`} />
      </div>

      {forecast.length > 0 && (
        <>
          <h4 className="mt-5 mb-3 text-center text-secondary fs-3">5-Day Forecast</h4>
          <div className="d-flex justify-content-between flex-wrap gap-3">
            {forecast.map(day => (
              <div key={day.dt} className="forecast-card p-4 rounded-4 bg-white text-center shadow-sm animate__animated animate__fadeInUp" style={{ minWidth: 120 }}>
                <Lottie
                  animationData={getWeatherLottie(day.weather[0].main)}
                  style={{ width: 60, height: 60, margin: '0 auto' }}
                  loop
                  autoplay
                />
                <div className="fw-semibold fs-5">{new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className="text-primary fs-3">{Math.round(day.main.temp)}°C</div>
                <div className="text-muted" style={{ fontSize: 15 }}>{day.weather[0].main}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherDisplay; 