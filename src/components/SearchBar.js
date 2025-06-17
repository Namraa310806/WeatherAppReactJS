import React from 'react';
import { MapPin } from 'lucide-react';

const SearchBar = ({ 
  city, 
  setCity, 
  handleSubmit, 
  handleLocation, 
  loading, 
  usingLocation, 
  inputRef 
}) => {
  return (
    <form onSubmit={handleSubmit} className="row gx-2 gy-2 mb-4 justify-content-center">
      <div className="col-12 col-md-auto">
        <input
          ref={inputRef}
          type="text"
          className="form-control form-control-lg rounded-pill"
          placeholder="Search for a city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="col-12 col-md-auto">
        <button type="submit" className="btn btn-outline-primary btn-lg rounded-pill w-100" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm" /> : 'Search'}
        </button>
      </div>
      <div className="col-12 col-md-auto">
        <button
          type="button"
          className="btn btn-outline-success btn-lg rounded-pill w-100"
          onClick={handleLocation}
          disabled={loading || usingLocation}
          title="Use my location"
        >
          <MapPin size={20} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar; 