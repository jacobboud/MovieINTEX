import { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { Movie } from '../types/Movie';

export default function MoviePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadMovies = async () => {
      const res = await axios.get('/api/AllMovies', {
        params: { search, genre, page },
      });
      setMovies((prev) => [...prev, ...res.data]);
    };

    loadMovies();
  }, [page, search, genre]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500
    ) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex gap-4">
        <input
          placeholder="Search by title..."
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
        <select onChange={(e) => setGenre(e.target.value)} className="input">
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Comedies">Comedies</option>
          {/* Add other genre options */}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.show_id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
