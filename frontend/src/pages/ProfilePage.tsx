import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface MovieDto {
  showId: string;
  title: string;
  description?: string;
}

interface RatingEntry {
  showId: string;
  title: string;
  rating: number;
}

export default function ProfilePage() {
  const [favoriteMovie, setFavoriteMovie] = useState<string>('');
  const [favoriteMovieTitle, setFavoriteMovieTitle] = useState<string>('None');

  const [ratings, setRatings] = useState<RatingEntry[]>([]);
  const [categories, setCategories] = useState<Record<string, boolean>>({});
  const [services, setServices] = useState<Record<string, boolean>>({});

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieDto[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('https://localhost:5000/api/user/profile', { withCredentials: true })
      .then((res) => {
        const data = res.data;
        setFavoriteMovie(data.favoriteMovie || '');
        setFavoriteMovieTitle(data.favoriteMovieTitle || 'None');
        setRatings(data.ratings || []);
        setCategories(data.categories || {});
        setServices(data.services || {});
      })
      .catch((err) => console.error('Failed to load profile:', err));
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await axios.get<MovieDto[]>(
        `https://localhost:5000/Movie/movies?query=${encodeURIComponent(query)}`
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSetFavorite = async (movie: MovieDto) => {
    try {
      await axios.put(
        'https://localhost:5000/api/user/favorite-movie',
        movie.showId,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setFavoriteMovie(movie.showId);
      setFavoriteMovieTitle(movie.title);
      setSearchResults([]);
      setQuery('');
    } catch (err) {
      console.error('Failed to set favorite movie', err);
    }
  };

  const handleRatingChange = (index: number, newRating: number) => {
    setRatings((prev) => {
      const updated = [...prev];
      updated[index].rating = newRating;
      return updated;
    });
  };

  const handleCategoryChange = (key: string) => {
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleServiceChange = (key: string) => {
    setServices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      await axios.put(
        'https://localhost:5000/api/user/ratings',
        ratings.map((r) => ({ showId: r.showId, rating: r.rating })),
        { withCredentials: true }
      );

      await axios.put(
        'https://localhost:5000/api/user/categories',
        categories,
        { withCredentials: true }
      );

      await axios.put('https://localhost:5000/api/user/services', services, {
        withCredentials: true,
      });

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error saving profile.');
    }
  };

  return (
    <div className="text-center text-black bg-gradient-to-br from-blue-500 to-blue-700 min-h-screen py-10">
      <button
        onClick={() => navigate('/movie')}
        className="absolute top-4 left-4 bg-white text-black px-4 py-2 rounded shadow"
      >
        ← Back to Movie Page
      </button>

      <h1 className="text-3xl font-bold mb-6">My Movie Experience</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Favorite Movie:</h2>
        <p className="mb-4">{favoriteMovieTitle}</p>

        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-2 rounded border mr-2"
        />
        <button
          onClick={handleSearch}
          className="bg-white text-black font-semibold px-3 py-2 rounded"
        >
          Search
        </button>

        <div className="mt-4 space-y-2">
          {searchResults.map((movie) => (
            <div
              key={movie.showId}
              className="bg-white text-black px-4 py-2 rounded flex justify-between items-center max-w-md mx-auto"
            >
              <span>{movie.title}</span>
              <button
                onClick={() => handleSetFavorite(movie)}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded"
              >
                Set as Favorite
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Movie Ratings:</h2>
        <table className="mx-auto text-sm bg-white text-black rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((entry, index) => (
              <tr key={`${entry.showId}-${index}`}>
                <td className="px-3 py-2">{entry.title}</td>
                <td className="px-3 py-2">
                  <select
                    value={entry.rating}
                    onChange={(e) =>
                      handleRatingChange(index, parseInt(e.target.value))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Favorite Categories:</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 text-left max-w-5xl mx-auto">
          {Object.keys(categories).map((key) => (
            <label key={key} className="block text-white">
              <input
                type="checkbox"
                checked={categories[key]}
                onChange={() => handleCategoryChange(key)}
                className="mr-2"
              />
              {key}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">My Streaming Services:</h2>
        <div className="columns-2 md:columns-3 gap-4 text-left max-w-3xl mx-auto">
          {Object.keys(services).map((key) => (
            <label key={key} className="block text-white">
              <input
                type="checkbox"
                checked={services[key]}
                onChange={() => handleServiceChange(key)}
                className="mr-2"
              />
              {key}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-white text-black font-semibold px-6 py-2 rounded mt-4"
      >
        Save
      </button>
    </div>
  );
}
