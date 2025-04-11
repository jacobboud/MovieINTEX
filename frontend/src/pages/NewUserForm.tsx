import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


interface MovieDto {
  show_id: string; // ✅ match the backend
  title: string;
  description?: string;
}

export default function NewUserForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [searchResults, setSearchResults] = useState<MovieDto[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDto | null>(null);

  const [streamingServices, setStreamingServices] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setSearchCompleted(false);
      setSearchResults([]);

      const res = await axios.get(
        `${API_BASE_URL}/Movie/movies?query=${encodeURIComponent(query)}`, 
        { withCredentials: true }
      );
      

      const results = Array.isArray(res.data) ? res.data : [];
      setSearchResults(results);
      setSelectedMovie(null);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchCompleted(true);
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    try {
      // Submit favorite movie
      if (selectedMovie) {
        console.log('🎬 Submitting favorite movie:', selectedMovie?.show_id);
        console.log('Type of showId:', typeof selectedMovie?.show_id);
        await axios.put(
          `${API_BASE_URL}/api/user/favorite-movie`,
          JSON.stringify(selectedMovie?.show_id),
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        
      }

      // Submit streaming services
      const servicesPayload: Record<string, boolean> = {};
      streamingServices.forEach(
        (service) =>
          (servicesPayload[service] = selectedServices.includes(service))
      );

      await axios.put(
        `${API_BASE_URL}/api/user/services`,
        servicesPayload,
        { withCredentials: true }
      );
      

      // Submit categories
      const categoryPayload: Record<string, boolean> = {};
      categories.forEach(
        (category) =>
          (categoryPayload[category] = selectedCategories.includes(category))
      );

      await axios.put(
        `${API_BASE_URL}/api/user/categories`,
        categoryPayload,
        { withCredentials: true }
      );
      

      // Navigate to movie page
      navigate('/movie');
    } catch (error) {
      console.error('Error submitting new user info:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    if (step === 3) {
      axios
      .get(`${API_BASE_URL}/Movie/categories`, {
        withCredentials: true,
      })
  
        .then((res) => setCategories(res.data))
        .catch((err) => console.error('Error fetching categories:', err));
    }
  }, [step]);

  useEffect(() => {
    setStreamingServices([
      'Netflix',
      'AmazonPrime',
      'DisneyPlus',
      'ParamountPlus',
      'Max',
      'Hulu',
      'AppleTVPlus',
      'Peacock',
    ]);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome New User!</h1>

      {step === 1 && (
        <>
          <p className="mb-6 text-sm">
            Please search for your favorite movie and select it below.
          </p>
          <div className="flex gap-2 mb-6 justify-center">
            <Input
              type="text"
              placeholder="Search for a movie..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              className="w-full max-w-md"
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
            <p className="text-red-500">
              No results found. Try a different title.
            </p>
          )}

          <div className="grid gap-4">
            {searchResults.map((movie) => (
              <Card key={movie.show_id} className="bg-white text-left">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-xl mb-1">{movie.title}</h3>
                  {movie.description && (
                    <p className="text-sm text-gray-700 mb-4">
                      {movie.description}
                    </p>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedMovie(movie);
                      setStep(2);
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {step === 2 && selectedMovie && (
        <>
        {console.log('🧪 selectedMovie @ step 2:', selectedMovie)}
          <div className="mb-6 text-left">
            <h2 className="text-xl font-semibold mb-2">You selected:</h2>
            <p className="text-gray-800">{selectedMovie.title}</p>
          </div>

          <div className="text-left">
            <h2 className="text-lg font-semibold mb-4">
              Which streaming services do you currently have?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {streamingServices.map((service) => (
                <label key={service} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  />
                  {service}
                </label>
              ))}
            </div>
            <Button
              onClick={() => setStep(3)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          {console.log('🧪 selectedMovie @ step 3:', selectedMovie)}
          <div className="mb-6 text-left">
            <h2 className="text-xl font-semibold mb-2">You selected:</h2>
            <p className="text-gray-800">{selectedMovie?.title}</p>
          </div>

          <div className="text-left">
            <h2 className="text-lg font-semibold mb-4">
              Select your favorite categories:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {categories.map((category) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Submit
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
