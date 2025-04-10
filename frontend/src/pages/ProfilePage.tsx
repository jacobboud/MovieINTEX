import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/BackNavBar';
import './ProfilePage.css';

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
      const res = await axios.get(
        `https://localhost:5000/Movie/movies?query=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
  
      // Manually map snake_case to camelCase
      const mappedResults = res.data.map((movie: any) => ({
        showId: movie.show_id,
        title: movie.title,
        releaseYear: movie.release_year,
        description: movie.description,
      }));
  
      console.log('🔍 Mapped Search results:', mappedResults);
  
      setSearchResults(mappedResults);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };
  

  const handleSetFavorite = async (movie: MovieDto) => {
    try {
      await axios.put(
        'https://localhost:5000/api/user/favorite-movie',
        { ShowId: movie.showId },
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
    <>
      <div>
        <NavBar />

        <h1 className="heading-bebas">My Movie Experience</h1>

        <h2>My Favorite Movie:</h2>
        <div className="section-container favorite-movie-section">
          <p>{favoriteMovieTitle}</p>

          <input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 rounded border mr-2"
          />
          <button onClick={handleSearch}>Search</button>

          <div className="movie-search-results">
            {searchResults.map((movie) => (
              <div key={movie.showId} className="movie-item">
                <span>{movie.title}</span>
                <button onClick={() => handleSetFavorite(movie)}>
                  Set as Favorite
                </button>
              </div>
            ))}
          </div>
        </div>

        <h2>My Movie Ratings:</h2>
        <div className="section-container movie-ratings-table">
          <table className="table-auto mx-auto">
            <thead>
              <tr>
                <th>Title</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((entry, index) => (
                <tr key={`${entry.showId}-${index}`}>
                  <td>{entry.title}</td>
                  <td>
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

        <h2>My Favorite Categories:</h2>
        <div className="section-container categories-services-section">
          <ul className="categories-list">
            {Object.keys(categories).map((key) => (
              <li key={key} className="categories-item">
                <span>{key}</span>
                <input
                  type="checkbox"
                  checked={categories[key]}
                  onChange={() => handleCategoryChange(key)}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Services Section */}
        <h2>My Streaming Services:</h2>
        <div className="section-container categories-services-section">
          <ul className="services-list">
            {Object.keys(services).map((key) => (
              <li key={key} className="services-item">
                <span>{key}</span>
                <input
                  type="checkbox"
                  checked={services[key]}
                  onChange={() => handleServiceChange(key)}
                />
              </li>
            ))}
          </ul>
        </div>

        <button onClick={handleSave} className="save-button">
          Save
        </button>

        <button
          onClick={() => navigate('/movie')}
          className="absolute top-4 left-4 bg-white text-black px-4 py-2 rounded shadow"
        >
          ← Back to Movie Page
        </button>
      </div>
    </>
  );
}
