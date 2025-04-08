import { useState } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

interface MovieDto {
  showId: string;
  title: string;
  description?: string;
}

export default function NewUserForm() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [searchResults, setSearchResults] = useState<MovieDto[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDto | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearchCompleted(false);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}movies?query=${encodeURIComponent(query)}`
      );
      setSearchResults(res.data);
      setSearchCompleted(true);
      setSelectedMovie(null);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome New User!</h1>
      <p className="mb-4">
        Please search for your favorite movie and select it below.
      </p>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          className="flex-grow"
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {loading && (
        <p className="text-gray-500 animate-pulse mb-4">
          Searching for results...
        </p>
      )}

      {searchCompleted && searchResults.length === 0 && (
        <p className="text-red-500">No results found. Try a different title.</p>
      )}

      <div className="grid gap-4">
        {searchResults.map((movie) => (
          <Card
            key={movie.showId}
            onClick={() => setSelectedMovie(movie)}
            className={`cursor-pointer transition-all border-2 ${
              selectedMovie?.showId === movie.showId
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{movie.title}</h3>
              {movie.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {movie.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMovie && (
        <div className="mt-6 p-4 border rounded bg-green-100">
          <h2 className="text-lg font-semibold">You selected:</h2>
          <p>{selectedMovie.title}</p>
        </div>
      )}
    </div>
  );
}
