import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

interface MovieDetailData {
  show_id: string;
  title: string;
  type: string;
  director?: string;
  cast?: string;
  country?: string;
  release_year?: number;
  rating?: string;
  duration?: string;
  description?: string;
  categories: string[];
  averageRating: number;
  userRating?: number;
}

export default function MovieDetail() {
  const { showId } = useParams<{ showId: string }>();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [userRating, setUserRating] = useState<number>(0);

  useEffect(() => {
    axios
      .get<MovieDetailData>(
        `https://localhost:5000/Movie/movie-details/${showId}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        setMovie(res.data);
        setUserRating(res.data.userRating ?? 0);
      })
      .catch((err) => console.error('Failed to fetch movie details:', err));
  }, [showId]);

  const handleRate = (rating: number) => {
    if (!movie) return;

    axios
      .post(
        'https://localhost:5000/Movie/rate',
        {
          showId: movie.show_id,
          rating: rating,
        },
        { withCredentials: true }
      )
      .then(() => setUserRating(rating))
      .catch((err) => console.error('Failed to submit rating:', err));
  };

  const renderStars = (rating: number, filled: boolean) => {
    return [...Array(5)].map((_, i) => {
      const full = i + 1 <= Math.floor(rating);
      const partial = i < rating && i + 1 > rating;

      return (
        <span
          key={i}
          onClick={() => !filled && handleRate(i + 1)}
          style={{
            cursor: !filled ? 'pointer' : 'default',
            fontSize: filled ? '20px' : '24px',
            marginRight: '4px',
            position: 'relative',
            display: 'inline-block',
            width: filled ? '20px' : '24px',
          }}
        >
          <span style={{ color: '#444' }}>★</span>
          {(full || partial) && (
            <span
              style={{
                color: '#FFD700',
                position: 'absolute',
                top: 0,
                left: 0,
                width: partial ? `${(rating - i) * 100}%` : '100%',
                overflow: 'hidden',
                clipPath: 'inset(0 0 0 0)',
              }}
            >
              ★
            </span>
          )}
        </span>
      );
    });
  };

  if (!movie) return <p style={{ color: '#fff' }}>Loading...</p>;

  const sanitizeTitleForFilename = (title: string) =>
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim();

  return (
    <div
      style={{
        background: '#000',
        color: '#fff',
        padding: '30px',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <img
        src={`/MoviePosters/${sanitizeTitleForFilename(movie.title)}.jpg`}
        alt={movie.title}
        style={{
          width: '300px',
          height: 'auto',
          borderRadius: '8px',
          objectFit: 'cover',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          marginBottom: '20px',
        }}
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />

      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>{movie.title}</h1>
      <p style={{ marginBottom: '10px' }}>
        <strong>Type:</strong> {movie.type}
      </p>
      {movie.director && (
        <p>
          <strong>Director:</strong> {movie.director}
        </p>
      )}
      {movie.cast && (
        <p>
          <strong>Cast:</strong> {movie.cast}
        </p>
      )}
      {movie.country && (
        <p>
          <strong>Country:</strong> {movie.country}
        </p>
      )}
      {movie.release_year && (
        <p>
          <strong>Year:</strong> {movie.release_year}
        </p>
      )}
      {movie.rating && (
        <p>
          <strong>Rating:</strong> {movie.rating}
        </p>
      )}
      {movie.duration && (
        <p>
          <strong>Duration:</strong> {movie.duration}
        </p>
      )}
      {movie.description && (
        <p
          style={{ marginTop: '10px', maxWidth: '600px', marginInline: 'auto' }}
        >
          {movie.description}
        </p>
      )}

      <div style={{ marginTop: '15px' }}>
        <strong>Genres:</strong>{' '}
        {movie.categories.length > 0 ? movie.categories.join(', ') : 'None'}
      </div>

      <div style={{ marginTop: '20px' }}>
        <strong>Average Rating:</strong>{' '}
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          {renderStars(movie.averageRating, true)}
        </span>
        <span style={{ marginLeft: '8px', color: '#ccc' }}>
          ({movie.averageRating.toFixed(1)} / 5)
        </span>
      </div>

      <div style={{ marginTop: '10px' }}>
        <strong>Your Rating:</strong> {renderStars(userRating, false)}
      </div>

      <div style={{ marginTop: '30px' }}>
        <button
          style={{
            padding: '10px 20px',
            background: '#1db954',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          ▶ Play
        </button>
      </div>
      <br />
      <Link
        to="/movie"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          backgroundColor: '#fff',
          color: '#000',
          padding: '6px 12px',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        ← Back to Movie Page
      </Link>
    </div>
  );
}
