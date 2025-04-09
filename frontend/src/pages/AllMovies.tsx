import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';
import MovieCard from '../components/MovieCard';

interface Movie {
  show_id: string;
  title: string;
  release_year: number;
  description: string;
}

const AllMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('NameAsc');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch filtered, sorted, paginated movies
  const fetchMovies = async () => {
    setLoading(true);
    const params: any = {
      page: currentPage,
      pageSize,
      sortBy,
    };
    if (category) params.category = category;

    try {
      const res = await axios.get('/Movie/paged-movies', { params });
      console.log('Fetched movies response:', res.data);

      if (Array.isArray(res.data.movies)) {
        setMovies(res.data.movies);
        const totalItems = res.data.total ?? 0;
        setTotalPages(Math.ceil(totalItems / pageSize));
      } else {
        console.warn('Unexpected movies format:', res.data);
        setMovies([]);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch movie categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/Movie/categories');
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        console.warn('Unexpected categories format:', res.data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  // Initial category load
  useEffect(() => {
    fetchCategories();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchMovies();
  }, [currentPage, sortBy, category]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string | null) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">All Movies</h1>

      {/* Category Buttons */}
      <div className="mb-3 d-flex flex-wrap gap-2 justify-content-center">
        <button
          className={`btn btn-outline-primary ${!category ? 'active' : ''}`}
          onClick={() => handleCategoryChange(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-outline-primary ${category === cat ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="mb-4 text-center">
        <label className="form-label me-2">Sort by:</label>
        <select
          className="form-select w-auto d-inline"
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="NameAsc">Name (A-Z)</option>
          <option value="NameDesc">Name (Z-A)</option>
          <option value="NotRated">Not Yet Rated</option>
        </select>
      </div>

      {/* Movie Grid */}
      <div className="row">
        {loading ? (
          <p className="text-center text-muted">Loading movies...</p>
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div className="col-md-3 mb-4" key={movie.show_id}>
              <MovieCard movie={movie} />
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No movies to show.</p>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AllMovies;
