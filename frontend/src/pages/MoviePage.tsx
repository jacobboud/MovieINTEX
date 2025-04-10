import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MoviePage.css';
import '../App.css';
import NavBar from '../components/BackNavBar';

interface CarouselItem {
  title: string;
  showId: string;
  description: string;
}

interface Carousel {
  title: string;
  items: CarouselItem[];
}

interface CarouselsResponse {
  name: string;
  carousels: Carousel[];
}

export default function MoviePage() {
  const [userName, setUserName] = useState('');
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [missingImages, setMissingImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CarouselItem[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  useEffect(() => {
    axios
      .get<CarouselsResponse>('https://localhost:5000/Movie/carousels', {
        withCredentials: true,
      })
      .then((res) => {
        console.log('🎬 Carousel Response:', res.data);
        setUserName(res.data.name);
        setCarousels(res.data.carousels);
      })
      .catch((err) => console.error('Failed to load carousels:', err));
  }, []);

  const handleSearch = async (query: string) => {
    setSearchSubmitted(true);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get<CarouselItem[]>(
        `https://localhost:5000/Movie/movies?query=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSubmitted(false);
  };

  const sanitizeTitleForFilename = (title: string) =>
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim();

  const isImageMissing = (title: string) =>
    missingImages.has(sanitizeTitleForFilename(title));

  if (carousels.length === 0) return null;

  const firstVisibleCarouselItems = carousels[0].items.filter(
    (item) => !isImageMissing(item.title)
  );
  const heroMovie = firstVisibleCarouselItems[0];

  return (
    <div>
      <NavBar />

      <h1 className="heading-bebas">Welcome {userName}</h1>

      {/* Hero Section */}
      {heroMovie && (
        <div className="hero-section">
          <div className="hero-text">
            <h2 className="hero-title">{heroMovie.title}</h2>
            <p className="hero-description">{heroMovie.description}</p>
          </div>
          <div className="hero-image">
            <img
              src={`/MoviePosters/${sanitizeTitleForFilename(heroMovie.title)}.jpg`}
              alt={heroMovie.title}
              onError={() =>
                setMissingImages(
                  (prev) =>
                    new Set(prev.add(sanitizeTitleForFilename(heroMovie.title)))
                )
              }
            />
          </div>
        </div>
      )}

      <div className="text-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}
        >
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-button"
              title="Clear search"
            >
              ❌
            </button>
          )}
          <button type="submit">Search</button>
        </form>
      </div>

      {searchSubmitted && (
        <div style={{ marginBottom: '30px' }}>
          <h2 className="carousel-title">Search Results</h2>
          {searchResults.length === 0 ? (
            <p style={{ color: '#ccc' }}>No results found.</p>
          ) : (
            <div className="carousel-items">
              {searchResults
                .filter((item) => !isImageMissing(item.title))
                .map((item) => {
                  const filename = sanitizeTitleForFilename(item.title);
                  return (
                    <div key={item.showId} className="movie-item">
                      <Link to={`/movie/${item.showId}`}>
                        <img
                          src={`/MoviePosters/${filename}.jpg`}
                          alt={item.title}
                          onError={() =>
                            setMissingImages(
                              (prev) => new Set(prev.add(filename))
                            )
                          }
                        />
                      </Link>
                      <p className="movie-title-p">{item.title}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Carousels */}
      {carousels.map((carousel, index) => {
        const visibleItems = carousel.items.filter(
          (item) => !isImageMissing(item.title)
        );

        if (visibleItems.length === 0) return null;

        return (
          <div key={carousel.title} className="carousel-section">
            {(index !== 0 || heroMovie) && (
              <h2 className="carousel-title">{carousel.title}</h2>
            )}

            {/* Carousel row */}
            <div className="carousel-items">
              {visibleItems.map((item) => {
                // Skip hero item from carousel
                if (index === 0 && item.showId === heroMovie?.showId)
                  return null;

                const filename = sanitizeTitleForFilename(item.title);

                return (
                  <div key={item.showId} className="movie-item">
                    <Link to={`/movie/${item.showId}`}>
                      <img
                        src={`/MoviePosters/${filename}.jpg`}
                        alt={item.title}
                        onError={() =>
                          setMissingImages(
                            (prev) => new Set(prev.add(filename))
                          )
                        }
                      />
                    </Link>
                    <p className="movie-title">{item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
