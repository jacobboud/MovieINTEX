import { Link } from 'react-router-dom';

export default function MovieCard({ movie }: { movie: any }) {
  return (
    <Link to={`/movie/${movie.showId}`}>
      <div className="card shadow hover:shadow-lg">
        <img
          src={movie.imageUrl}
          alt={movie.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-2">
          <h3 className="text-lg font-bold">{movie.title}</h3>
        </div>
      </div>
    </Link>
  );
}
