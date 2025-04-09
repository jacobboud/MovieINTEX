import { Link, useLocation } from 'react-router-dom';

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
      <div className="card shadow hover:shadow-lg h-100">
        <img
          src={imagePath}
          alt={movie.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/MoviePosters/default.jpg';
          }}
        />
        <div className="p-2">
          <h3 className="text-lg font-bold">{movie.title}</h3>
        </div>
      </div>
    </Link>
  );
}
