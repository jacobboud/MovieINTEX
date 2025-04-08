import { useEffect, useState } from 'react';
import axios from 'axios';

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
  const firstCarousel = carousels[0];
  const heroMovie = firstCarousel.items.find(
    (item) => !isImageMissing(item.title)
  );

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        minHeight: '100vh',
        padding: '20px',
      }}
    >
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
                        setMissingImages((prev) => new Set(prev.add(filename)))
                      }
                    />
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
