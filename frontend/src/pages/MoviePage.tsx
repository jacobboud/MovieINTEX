import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface MovieDto {
  showId: number;
  title: string;
  description?: string;
}

export default function MoviePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedMovie,
    selectedServices,
    selectedCategories,
  }: {
    selectedMovie?: MovieDto;
    selectedServices?: string[];
    selectedCategories?: string[];
  } = location.state || {};

  // Redirect back if no data was passed
  useEffect(() => {
    if (!selectedMovie) {
      navigate('/new-user');
    }
  }, [selectedMovie, navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Preferences</h1>

      {selectedMovie && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">🎬 Favorite Movie</h2>
          <p className="font-medium">{selectedMovie.title}</p>
          {selectedMovie.description && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedMovie.description}
            </p>
          )}
        </div>
      )}

      {selectedServices && selectedServices.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">📺 Streaming Services</h2>
          <ul className="list-disc list-inside">
            {selectedServices.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </div>
      )}

      {selectedCategories && selectedCategories.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">🎞 Favorite Categories</h2>
          <ul className="list-disc list-inside">
            {selectedCategories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate('/')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
