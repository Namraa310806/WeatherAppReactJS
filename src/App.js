import React, { useState, useEffect, useRef } from 'react';
import {
  Wind, Droplets, Gauge, Eye, Sun, Cloud, CloudRain, CloudSnow, MapPin
} from 'lucide-react';
import Lottie from 'lottie-react';
import sunnyAnimation from './lottie/sunny.json';
import rainAnimation from './lottie/rain.json';
import cloudAnimation from './lottie/cloud.json';
import snowAnimation from './lottie/snow.json';
import 'animate.css';

// Utility functions
const formatTime = (timestamp, timezone) => {
  return new Date((timestamp + timezone) * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getWeatherLottie = (weatherMain) => {
  switch (weatherMain) {
    case 'Clear':
      return sunnyAnimation;
    case 'Clouds':
      return cloudAnimation;
    case 'Rain':
      return rainAnimation;
    case 'Snow':
      return snowAnimation;
    default:
      return sunnyAnimation;
  }
};

const getBackgroundClass = (weatherMain) => {
  switch (weatherMain) {
    case 'Clear': return 'bg-sunny';
    case 'Rain': return 'bg-rainy';
    case 'Snow': return 'bg-snowy';
    case 'Clouds': return 'bg-cloudy';
    default: return 'bg-default';
  }
};

const DEFAULT_CITY = 'London';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [usingLocation, setUsingLocation] = useState(false);
  const inputRef = useRef(null);

  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'b93ea1c2df7a727d42cb6be178031af0';
  const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  const fetchWeather = async (cityName, coords) => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);

    let url = '';
    if (coords) {
      url = `${WEATHER_URL}?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`;
    } else if (cityName) {
      url = `${WEATHER_URL}?q=${cityName}&appid=${API_KEY}&units=metric`;
    } else {
      setError('Please enter a city name.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === 200) {
        setWeather(data);
        fetchForecast(data.coord);
      } else {
        setError(data.message || 'City not found.');
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (coord) => {
    try {
      const response = await fetch(
        `${FORECAST_URL}?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod === "200") {
        const daily = data.list.filter(item => item.dt_txt.includes('12:00:00'));
        setForecast(daily.slice(0, 5));
      }
    } catch (err) {
      // forecast error ignored
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsingLocation(false);
    fetchWeather(city);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchWeather(DEFAULT_CITY);
  }, []);

  useEffect(() => {
    if (error && city) setError('');
  }, [city]);

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setUsingLocation(true);
    setError('');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(null, {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        setError('Unable to retrieve your location.');
        setLoading(false);
        setUsingLocation(false);
      }
    );
  };

  return (
    <div className={`weather-bg min-vh-100 d-flex flex-column`}>
      <header className="py-4 shadow-sm bg-white text-center">
        <h1 className="mb-1 gradient-title fw-bold display-4 animate__animated animate__fadeInDown">
          🌦️ Weather App by NP
        </h1>
      </header>


      <main className="flex-grow-1 d-flex align-items-center justify-content-center mt-2">
        <div className="weather-card shadow-lg p-5 bg-light bg-gradient rounded-4 animate__animated animate__fadeInDown w-100" style={{ maxWidth: 900 }}>
          <form onSubmit={handleSubmit} className="d-flex gap-3 mb-4">
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-lg rounded-pill"
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-outline-primary rounded-pill px-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'Search'}
            </button>
            <button
              type="button"
              className="btn btn-outline-success rounded-pill px-4"
              onClick={handleLocation}
              disabled={loading || usingLocation}
              title="Use my location"
            >
              <MapPin size={20} />
            </button>
          </form>

          {error && (
            <div className="alert alert-danger text-center animate__animated animate__shakeX">{error}</div>
          )}

          {weather && !loading && (
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
                          style={{ width: 60, height: 60 }}
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
          )}
        </div>
      </main>

      <style>{`
        .weather-bg {
          background: linear-gradient(to right, #dbe6f6, #c5796d);
          min-height: 100vh;
        }

        .bg-sunny {
          background: linear-gradient(to right, #fceabb, #f8b500);
        }

        .bg-rainy {
          background: linear-gradient(to right, #a1c4fd, #c2e9fb);
        }

        .bg-snowy {
          background: linear-gradient(to right, #e0eafc, #cfdef3);
        }

        .bg-cloudy {
          background: linear-gradient(to right, #bdc3c7, #2c3e50);
        }

        .bg-default {
          background: linear-gradient(to right, #f8fafc, #e2eafc);
        }

        .weather-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 2rem;
          transition: all 0.3s ease-in-out;
        }

        .forecast-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease;
        }

        .forecast-card:hover {
          transform: translateY(-6px);
        }

        .weather-detail-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          transition: transform 0.3s ease;
        }

        .weather-detail-card:hover {
          transform: translateY(-4px);
        }

        @media (max-width: 768px) {
          .weather-card {
            padding: 2rem 1rem;
            margin: 0 1rem;
          }

          .forecast-card {
            flex: 1 1 100%;
          }
          .gradient-title {
            background: linear-gradient(90deg, #007cf0, #00dfd8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          main {
            padding-top: 40px;
            padding-bottom: 40px;
          }

        }
      `}</style>
    </div>
  );
};

const WeatherDetail = ({ icon, label, value }) => (
  <div className="col-md-6 col-lg-3">
    <div className="weather-detail-card p-4 text-center h-100 animate__animated animate__fadeInUp">
      <div className="mb-2">{icon}</div>
      <div className="fw-semibold fs-5">{label}</div>
      <div className="text-primary fs-4 mt-1">{value}</div>
    </div>
  </div>
);

export default WeatherApp;
