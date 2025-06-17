import React from 'react';

const WeatherDetail = ({ icon, label, value }) => (
  <div className="col-md-6 col-lg-3">
    <div className="weather-detail-card p-4 text-center h-100 animate__animated animate__fadeInUp">
      <div className="mb-2">{icon}</div>
      <div className="fw-semibold fs-5">{label}</div>
      <div className="text-primary fs-4 mt-1">{value}</div>
    </div>
  </div>
);

export default WeatherDetail; 