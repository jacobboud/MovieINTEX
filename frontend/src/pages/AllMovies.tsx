import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../components/Pagination';
import MovieCard from '../components/MovieCard';
//import { Link } from 'react-router-dom';
import NavBar from '../components/BackNavBar';
import './AllMovies.css';
import Footer from '../components/Footer';

interface Movie {
  show_id: string;
  title: string;
  release_year: number;
  description: string;
}

const columnToPropertyMap: { [key: string]: string } = {
  Action: 'Action',
  Adventure: 'Adventure',
  'Anime Series International TV Shows': 'AnimeSeries',
  'British TV Shows Docuseries International TV Shows': 'BritishSeries',
  Comedies: 'Comedies',
  Children: 'Children',
  'Crime TV Shows Docuseries': 'CrimeTVShowsDocuseries',
  Documentaries: 'Documentaries',
  Docuseries: 'Docuseries',
  Dramas: 'Dramas',
  Fantasy: 'Fantasy',
  'Family Movies': 'Family',
  'Horror Movies': 'Horror',
  'Comedies International Movies': 'InternationalComedies',
  'Comedies Dramas International Movies': 'InternationalComedyDramas',
  'Documentaries International Movies': 'InternationalDocumentaries',
  'Dramas International Movies': 'InternationalDramas',
  'International TV Shows Romantic TV Shows TV Dramas':
    'InternationalTVRomanticDramas',
  'International Movies Thrillers': 'InternationalThrillers',
  "Kids' TV": 'Kids',
  'Language TV Shows': 'Language',
  Musicals: 'Musicals',
  'Nature TV': 'NatureTV',
  'Reality TV': 'RealityTV',
  'Comedies Romantic Movies': 'RomanticComedies',
  'Dramas Romantic Movies': 'RomanticDramas',
  Spirituality: 'Spirituality',
  'Talk Shows TV Comedies': 'TalkShowTVComedies',
  Thrillers: 'Thrillers',
  'TV Action': 'ActionTV',
  'TV Comedies': 'ComedyTV',
  'TV Dramas': 'DramaTV',
};

const AllMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('NameAsc');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [normalizedCategory, setNormalizedCategory] = useState<string | null>(
    null
  );

  // Fetch filtered, sorted, paginated movies
  const fetchMovies = async () => {
    setLoading(true);
    const params: any = {
      page: currentPage,
      pageSize: selectedPageSize,
      withCredentials: true,
      sortBy,
    };
    if (normalizedCategory) params.category = normalizedCategory;

    try {
      const res = await axios.get('/Movie/paged-movies', {
        params,
        withCredentials: true,
      });
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
      const res = await axios.get('/Movie/categories', {
        withCredentials: true,
      });
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

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!category) {
        try {
          const res = await axios.get('/Movie/carousels', {
            withCredentials: true,
          });
          if (res.data?.carousels?.length > 0) {
            const recommendedForYou = res.data.carousels.find((c: any) =>
              c.title?.toLowerCase().includes('recommended for you')
            );
            setRecommendedMovies(recommendedForYou?.items || []);
          } else {
            setRecommendedMovies([]);
          }
        } catch (err) {
          console.error('Error fetching general recommendations:', err);
          setRecommendedMovies([]);
        }
        return;
      }

      try {
        const res = await axios.get('/Movie/category-recommendations', {
          params: { category: normalizedCategory },
          withCredentials: true,
        });
        setRecommendedMovies(res.data);
      } catch (err) {
        console.error('Error fetching category recommendations:', err);
        setRecommendedMovies([]);
      }
    };

    fetchRecommendations();
  }, [category]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string | null) => {
    if (cat === null) {
      setCategory(null);
      setNormalizedCategory(null);
    } else {
      setCategory(cat); // e.g., "Anime Series International TV Shows"
      setNormalizedCategory(columnToPropertyMap[cat] ?? null); // e.g., "AnimeSeries"
    }
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = async (query: string) => {
    setSearchSubmitted(true);

    if (query.trim() === '') {
      setSearchResults([]);
      setSearchSubmitted(false);
      return;
    }

    try {
      const res = await axios.get<Movie[]>(
        `https://localhost:5000/Movie/movies?query=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSubmitted(false);
  };

  return (
    <div className="container my-4">
      <NavBar />
      <h1 className="heading-bebas">All Movies</h1>

      {/* 🔍 Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(searchQuery);
        }}
        className="d-flex justify-content-center gap-4 mb-4 flex-wrap"
      >
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="clear-button"
            title="Clear search"
          >
            ❌
          </button>
        )}
        <button type="submit">Search</button>
      </form>

      {/* 🔽 Filters + Sorting */}
      <div className="d-flex justify-content-center gap-4 flex-wrap mb-4">
        <div>
          <label className="form-label">Filter by Genre:</label>
          <select
            className="form-select"
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

        <div>
          <label className="form-label">Sort by:</label>
          <select
            className="form-select"
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

        <div>
          <label className="form-label">Movies per Page:</label>
          <select
            className="form-select"
            value={selectedPageSize}
            onChange={handlePageSizeChange}
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Recommended for You Section (when no category is selected) */}
      {!category && recommendedMovies.length > 0 && (
        <div className="recommended-section">
          <h3 className="recommended-header">Recommended for You</h3>
          <div className="recommended-carousel">
            {recommendedMovies.slice(0, 10).map((movie) => (
              <div key={movie.show_id} className="carousel-card">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Recommendation Section */}
      {category && recommendedMovies.length > 0 && (
        <div className="recommended-section">
          <h3 className="recommended-header">Recommended {category} Movies</h3>
          <div className="recommended-carousel">
            {recommendedMovies.slice(0, 10).map((movie) => (
              <div key={movie.show_id} className="carousel-card">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="all-movies-header">All Movies</h2>

      {/* 🎬 Main Grid */}
      <div
        className={`movie-grid ${searchResults.length > 0 ? 'extra-bottom-margin' : ''} `}
      >
        {loading ? (
          <p className="text-center text-muted">Loading movies...</p>
        ) : searchSubmitted ? (
          searchResults.length > 0 ? (
            searchResults.map((movie) => (
              <div className="movie-card-wrapper" key={movie.show_id}>
                <MovieCard movie={movie} />
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No search results found.</p>
          )
        ) : movies.length > 0 ? (
          movies.map((movie) => (
            <div className="movie-card-wrapper" key={movie.show_id}>
              <MovieCard movie={movie} />
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No movies to show.</p>
        )}
      </div>

      {/* 🔄 Pagination */}
      {!searchSubmitted && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <Footer />
    </div>
  );
};

export default AllMovies;
