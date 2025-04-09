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
  const [selectedPageSize, setSelectedPageSize] = useState(12);
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
      pageSize: selectedPageSize,
      withCredentials: true,
      sortBy,
    };
    if (category) params.category = category;

    try {
      const res = await axios.get('/Movie/paged-movies', { params, withCredentials: true, });
      console.log('Fetched movies response:', res.data);

      if (Array.isArray(res.data.movies)) {
        setMovies(res.data.movies);
        const totalItems = res.data.total ?? 0;
        setTotalPages(Math.ceil(totalItems / selectedPageSize));
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
      const res = await axios.get('/Movie/categories', {withCredentials: true,});
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
  }, [currentPage, sortBy, category, selectedPageSize]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string | null) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="container my-4">
      <h1 className="mb-4 text-center">All Movies</h1>

      {/* Filter + Sort + Page Size Controls */}
      <div className="d-flex flex-wrap justify-content-center gap-4 mb-4">
        {/* Category Dropdown */}
        <div className="text-center">
          <label className="form-label me-2 fw-semibold">
            Filter by Genre:
          </label>
          <select
            className="form-select w-auto d-inline"
            value={category ?? 'All'}
            onChange={(e) =>
              handleCategoryChange(
                e.target.value === 'All' ? null : e.target.value
              )
            }
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="text-center">
          <label className="form-label me-2 fw-semibold">Sort by:</label>
          <select
            className="form-select w-auto d-inline"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="NameAsc">Name (A-Z)</option>
            <option value="NameDesc">Name (Z-A)</option>
            <option value="NotRated">Not Yet Rated</option>
            <option value="RatingHigh">Rating (Highest)</option>
            <option value="RatingLow">Rating (Lowest)</option>
          </select>
        </div>

        {/* Page Size Dropdown */}
        <div className="text-center">
          <label className="form-label me-2 fw-semibold">
            Movies per Page:
          </label>
          <select
            className="form-select w-auto d-inline"
            value={selectedPageSize}
            onChange={handlePageSizeChange}
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Optional Recommendation Section */}
      {category && (
        <div className="mb-4">
          <h3 className="text-center">
            Recommended {category} Movies You Might Like
          </h3>
          <div className="row justify-content-center">
            {movies.slice(0, 4).map((movie) => (
              <div className="col-md-3 mb-4" key={movie.show_id}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Movie Grid */}
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
