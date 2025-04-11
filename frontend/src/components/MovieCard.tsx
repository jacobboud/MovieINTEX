import { Link, useLocation } from 'react-router-dom';
import './MovieCard.css';

const sanitizeTitleForFilename = (title: string) => {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
};

export default function MovieCard({ movie }: { movie: any }) {
  const filename = sanitizeTitleForFilename(movie.title);
  const imagePath = `/MoviePosters/${filename}.jpg`;

  const location = useLocation();

  return (
    <Link to={`/movie/${movie.showId}`} state={{ from: location.pathname }}>
      <div className="movie-card shadow hover:shadow-lg">
        <img
          src={imagePath}
          alt={movie.title}
          className="movie-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/MoviePosters/default.jpg'; // 👈 use a placeholder image
          }}
        />
        <div className="movie-card-body">
          <h3 className="movie-title">{movie.title}</h3>
        </div>
      </div>
    </Link>
  );
}
