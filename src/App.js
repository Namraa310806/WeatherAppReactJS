import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import sunnyAnimation from './lottie/sunny.json';
import rainAnimation from './lottie/rain.json';
import cloudAnimation from './lottie/cloud.json';
import snowAnimation from './lottie/snow.json';
import 'animate.css';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';

const formatTime = (timestamp, timezone) => {
  return new Date((timestamp + timezone) * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getWeatherLottie = (weatherMain) => {
  switch (weatherMain) {
    case 'Clear': return sunnyAnimation;
    case 'Clouds': return cloudAnimation;
    case 'Rain': return rainAnimation;
    case 'Snow': return snowAnimation;
    default: return sunnyAnimation;
  }
};

const DEFAULT_CITY = 'London';

const App = () => {
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
    } catch (err) {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsingLocation(false);
    fetchWeather(city);
  };

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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchWeather(DEFAULT_CITY);
  }, []);

  return (
    <div className="weather-bg min-vh-100 d-flex flex-column">
      <header className="py-4 shadow-sm bg-white text-center">
        <h1 className="mb-1 gradient-title fw-bold display-4 animate__animated animate__fadeInDown">
          🌦️ Weather App by NP
        </h1>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center mt-4">
        <div className="weather-card shadow-lg p-5 bg-light bg-gradient rounded-4 animate__animated animate__fadeInDown w-100" style={{ maxWidth: 900 }}>
          <SearchBar
            city={city}
            setCity={setCity}
            handleSubmit={handleSubmit}
            handleLocation={handleLocation}
            loading={loading}
            usingLocation={usingLocation}
            inputRef={inputRef}
          />

          {error && (
            <div className="alert alert-danger text-center animate__animated animate__shakeX">{error}</div>
          )}

          {weather && !loading && (
            <WeatherDisplay
              weather={weather}
              forecast={forecast}
              getWeatherLottie={getWeatherLottie}
              formatTime={formatTime}
            />
          )}
        </div>
      </main>

      <style>{`
        .weather-bg {
          background: linear-gradient(to right, #dbe6f6, #c5796d);
        }

        .weather-card {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 2rem;
        }

        .forecast-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 1.5rem;
          transition: transform 0.3s ease;
        }

        .forecast-card:hover {
          transform: translateY(-6px);
        }

        .weather-detail-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 1rem;
        }

        .gradient-title {
          background: linear-gradient(90deg, #007cf0, #00dfd8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default App;
