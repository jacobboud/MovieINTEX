import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    axios
      .get<CarouselsResponse>('https://localhost:5000/Movie/carousels', {
        withCredentials: true,
      })
      .then((res) => {
        setUserName(res.data.name);
        setCarousels(res.data.carousels);
      })
      .catch((err) => console.error('Failed to load carousels:', err));
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

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

  const sanitizeTitleForFilename = (title: string) => {
    return title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim();
  };

  const isImageMissing = (title: string) =>
    missingImages.has(sanitizeTitleForFilename(title));

  if (carousels.length === 0) return null;

  // Find first visible hero movie from first carousel
  const firstVisibleCarouselItems = carousels[0].items.filter(
    (item) => !isImageMissing(item.title)
  );
  const heroMovie = firstVisibleCarouselItems[0];

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
      <div className="text-right mb-4">
        <Link
          to="/profile"
          className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
        >
          Edit Profile
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            padding: '10px',
            width: '80%',
            maxWidth: '400px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        For {userName}
      </h1>

      {/* Hero Section */}
      {heroMovie && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <img
            src={`/MoviePosters/${sanitizeTitleForFilename(heroMovie.title)}.jpg`}
            alt={heroMovie.title}
            style={{
              width: '400px',
              height: 'auto',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            }}
            onError={() =>
              setMissingImages(
                (prev) =>
                  new Set(prev.add(sanitizeTitleForFilename(heroMovie.title)))
              )
            }
          />
          <h2 style={{ fontSize: '20px', marginTop: '10px' }}>
            {heroMovie.title}
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#ccc',
              maxWidth: '400px',
              margin: '0 auto',
            }}
          >
            {heroMovie.description}
          </p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textAlign: 'left',
            }}
          >
            Search Results
          </h2>
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '12px',
              paddingBottom: '8px',
            }}
          >
            {searchResults
              .filter((item) => !isImageMissing(item.title))
              .map((item) => {
                const filename = sanitizeTitleForFilename(item.title);
                return (
                  <div
                    key={item.showId}
                    style={{
                      width: '160px',
                      flexShrink: 0,
                      textAlign: 'center',
                    }}
                  >
                    <Link to={`/movie/${item.showId}`}>
                      <img
                        src={`/MoviePosters/${filename}.jpg`}
                        alt={item.title}
                        style={{
                          width: '160px',
                          height: '240px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                        onError={() =>
                          setMissingImages(
                            (prev) => new Set(prev.add(filename))
                          )
                        }
                      />
                    </Link>
                    <p
                      style={{
                        fontSize: '12px',
                        marginTop: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Carousels */}
      {carousels.map((carousel, index) => {
        const visibleItems = carousel.items.filter(
          (item) => !isImageMissing(item.title)
        );

        if (visibleItems.length === 0) return null;

        return (
          <div key={carousel.title} style={{ marginBottom: '40px' }}>
            {/* Header: skip for first if it's the hero, but show left-aligned header still */}
            {(index !== 0 || heroMovie) && (
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  textAlign: 'left',
                }}
              >
                {carousel.title}
              </h2>
            )}

            {/* Carousel row */}
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '12px',
                paddingBottom: '8px',
              }}
            >
              {visibleItems.map((item) => {
                // Skip hero item from carousel
                if (index === 0 && item.showId === heroMovie?.showId)
                  return null;

                const filename = sanitizeTitleForFilename(item.title);

                return (
                  <div
                    key={item.showId}
                    style={{
                      width: '160px',
                      flexShrink: 0,
                      textAlign: 'center',
                    }}
                  >
                    <Link to={`/movie/${item.showId}`}>
                      <img
                        src={`/MoviePosters/${filename}.jpg`}
                        alt={item.title}
                        style={{
                          width: '160px',
                          height: '240px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                        onError={() =>
                          setMissingImages(
                            (prev) => new Set(prev.add(filename))
                          )
                        }
                      />
                    </Link>

                    <p
                      style={{
                        fontSize: '12px',
                        marginTop: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </p>
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
