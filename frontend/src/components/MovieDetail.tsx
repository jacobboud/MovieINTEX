import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import './MovieDetail.css';
import BackNavBar from './BackNavBar';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<MovieDetailData[]>([]);

  // Grab 'from' path or fallback
  const from = location.state?.from || '/movie';

  useEffect(() => {
    if (!showId) return;

    // Fetch movie details
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

    // Fetch recommendations
    axios
      .get<MovieDetailData[]>(
        `https://localhost:5000/Movie/movie-recommendations/${showId}`,
        {
          withCredentials: true,
        }
      )
      .then((res) => setRecommendations(res.data))
      .catch((err) =>
        console.error('Failed to fetch movie recommendations:', err)
      );
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
    <div className="movie-detail-container">
      <BackNavBar />
      <img
        src={`/MoviePosters/${sanitizeTitleForFilename(movie.title)}.jpg`}
        alt={movie.title}
        className="movie-poster"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />

      <h1 className="movie-title">{movie.title}</h1>
      <div className="movie-details">
        <p>
          <strong>Type:</strong> {movie.type}
        </p>{' '}
        {movie.director && (
          <p>
            <strong>Director:</strong> {movie.director}
          </p>
        )}{' '}
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
          <>
            <p className="description-heading">
              <strong>Description:</strong>
            </p>
            <p className="movie-description">{movie.description}</p>
          </>
        )}
      </div>

      <div className="movie-genres">
        <strong>Genres:</strong>{' '}
        {movie.categories.length > 0 ? movie.categories.join(', ') : 'None'}
      </div>

      <div className="movie-rating">
        <strong>Average Rating:</strong>{' '}
        <div className="rating-container">
          {renderStars(movie.averageRating, true)}
        </div>
        <span>({movie.averageRating.toFixed(1)}/5)</span>
      </div>

      <div className="user-rating">
        <strong>Your Rating:</strong> {renderStars(userRating, false)}
      </div>

      <div className="play-button-container">
        <button className="play-button">▶ Play</button>
      </div>

      <div className="recommendations-section">
        {recommendations.length > 0 && (
          <div>
            <h2>Viewers Also Liked</h2>
            <div className="recommendations-container">
              {recommendations.map((rec) => {
                const filename = sanitizeTitleForFilename(rec.title);
                return (
                  <div key={rec.show_id} className="recommendation-item">
                    <Link to={`/movie/${rec.show_id}`}>
                      <img
                        src={`/MoviePosters/${filename}.jpg`}
                        alt={rec.title}
                        onError={(e) =>
                          (e.currentTarget.style.display = 'none')
                        }
                      />
                    </Link>
                    <p>{rec.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <br />
      <button onClick={() => navigate(from)} className="back-button">
        ← Back to Previous Page
      </button>
    </div>
  );
}
