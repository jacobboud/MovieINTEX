import React, { useState } from 'react';
import { Button, Table, Form, Modal, Pagination } from 'react-bootstrap';
import { Movie } from '../types/Movie'; // adjust path if needed
import AuthorizeView, { AuthorizedUser } from '../components/AuthorizeView';
import Logout from '../components/Logout';
import { useEffect } from 'react';

const ManageMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<
    (Partial<Movie> & { durationValue?: string; durationUnit?: string }) | null
  >(null);
  const [totalPages, setTotalPages] = useState(1);
  const genreToKey = (genre: string) => genre.toLowerCase().replace(/\s+/g, '');

  useEffect(() => {
    fetch(
      `https://localhost:5000/Movie/paged-movies?page=${currentPage}&pageSize=${pageSize}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        console.log('Fetched movies:', data.movies);
        setMovies(data.movies);
        setTotalPages(Math.ceil(data.total / pageSize));
      })
      .catch((error) => {
        console.error('Error fetching movies:', error);
        alert('Failed to fetch movies: ' + error.message);
      });
  }, [currentPage, pageSize]);

  //const totalPages = Math.ceil(movies.length / pageSize);
  const currentMovies = movies;

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      fetch(`https://localhost:5000/Movie/DeleteMovie/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.ok) {
            // Update the frontend after deletion
            setMovies(movies.filter((m) => m.show_id !== id));
          } else {
            console.error('Error deleting movie:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Error deleting movie:', error);
        });
    }
  };

  const handleSave = () => {
    if (!editingMovie) return;

    const isNew = editingMovie.show_id === undefined;

    const duration = `${editingMovie.durationValue} ${editingMovie.durationUnit}`;
    const payload = {
      ...editingMovie,
      duration,
    };

    const url = isNew
      ? 'https://localhost:5000/Movie/AddMovie'
      : `https://localhost:5000/Movie/UpdateMovie/${editingMovie.show_id}`;
    const method = isNew ? 'POST' : 'PUT';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to ${isNew ? 'add' : 'update'} movie.`);
        }
        return res.json();
      })
      .then((data) => {
        if (isNew) {
          setMovies((prev) => [...prev, data]);
        } else {
          setMovies((prev) =>
            prev.map((movie) =>
              movie.show_id === editingMovie.show_id ? data : movie
            )
          );
        }
        setShowModal(false);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message);
      });
  };

  // Available genres (you can expand this list based on your requirements)
  const genreOptions = [
    'Action',
    'Adventure',
    'Anime Series',
    'British Series',
    'Children',
    'Comedies',
    'International Comedy Dramas',
    'International Comedies',
    'Romantic Comedies',
    'Crime TV Shows Docuseries',
    'Documentaries',
    'International Documentaries',
    'Docuseries',
    'Dramas',
    'International Dramas',
    'Romantic Dramas',
    'Family',
    'Fantasy',
    'Horror',
    'International Thrillers',
    'International TV Romantic Dramas',
    'Kids',
    'Language',
    'Musicals',
    'Nature TV',
    'Reality TV',
    'Spirituality',
    'Action TV',
    'Comedy TV',
    'Drama TV',
    'Talk Show TV Comedies',
    'Thrillers',
  ];

  return (
    <AuthorizeView>
      <span>
        <Logout>
          Logout <AuthorizedUser value="email" />
        </Logout>
      </span>
      <div className="container mt-5">
        <h2 className="mb-4">Manage Movies</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Select
            style={{ width: '150px' }}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            value={pageSize}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </Form.Select>
          <Button
            onClick={() => {
              setEditingMovie(null);
              setShowModal(true);
            }}
          >
            Add Movie
          </Button>
        </div>

        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Director</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMovies.map((movie) => (
                <tr key={movie.show_id}>
                  <td>{movie.title}</td>
                  <td>{movie.director}</td>
                  <td>{movie.release_year}</td>
                  <td>{movie.rating}</td>
                  <td>{movie.duration}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => {
                        const [durationValue, ...durationRest] =
                          movie.duration?.split(' ') || [];
                        const durationUnit = durationRest.join(' ');

                        setEditingMovie({
                          ...movie,
                          durationValue,
                          durationUnit,
                        });
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </Button>{' '}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(movie.show_id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <br></br>
        <Pagination className="justify-content-center">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />

          {Array.from({ length: totalPages }, (_, idx) => idx + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
            )
            .map((page, index, array) => {
              const prevPage = array[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && <Pagination.Ellipsis disabled />}
                  <Pagination.Item
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                </React.Fragment>
              );
            })}

          <Pagination.Next
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingMovie?.show_id ? 'Edit Movie' : 'Add Movie'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Other fields */}
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  value={editingMovie?.title || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      title: e.target.value,
                    })
                  }
                />
              </Form.Group>
              {/* Type dropdown */}
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={editingMovie?.type || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      type: e.target.value,
                    })
                  }
                >
                  <option>Select</option>
                  <option value="Movie">Movie</option>
                  <option value="TV-Series">TV-Series</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Genres</Form.Label>
                <Form.Select
                  multiple
                  value={genreOptions.filter(
                    (genre) =>
                      (editingMovie as Record<string, any>)?.[genreToKey(genre)]
                  )}
                  onChange={(e) => {
                    const selectedGenres = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );

                    const updatedGenres: Record<string, boolean> = {};
                    genreOptions.forEach((genre) => {
                      const key = genreToKey(genre);
                      updatedGenres[key] = selectedGenres.includes(genre);
                    });

                    setEditingMovie({
                      ...editingMovie!,
                      ...updatedGenres,
                    });
                  }}
                >
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Release year input */}
              <Form.Group className="mb-3">
                <Form.Label>Release Year</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter Release Year"
                  value={editingMovie?.release_year || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const releaseYear = value ? parseInt(value, 10) : undefined; // convert to number or undefined if empty
                    setEditingMovie({
                      ...editingMovie!,
                      release_year: releaseYear, //set the parsed number
                    });
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Director</Form.Label>
                <Form.Control
                  value={editingMovie?.director || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      director: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Cast</Form.Label>
                <Form.Control
                  value={editingMovie?.cast || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      cast: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  value={editingMovie?.country || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      country: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  value={editingMovie?.rating || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      rating: e.target.value,
                    })
                  }
                >
                  {editingMovie?.type === 'Movie' ? (
                    <>
                      <option>Select</option>
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="UR">UR</option>
                      <option value="NR">NR</option>
                    </>
                  ) : editingMovie?.type === 'TV-Series' ? (
                    <>
                      <option>Select</option>
                      <option value="TV-G">TV-G</option>
                      <option value="TV-14">TV-14</option>
                      <option value="TV-PG">TV-PG</option>
                      <option value="TV-Y">TV-Y</option>
                      <option value="TV-MA">TV-MA</option>
                      <option value="TV-Y7">TV-Y7</option>
                      <option value="TV-Y7-FV">TV-Y7-FV</option>
                    </>
                  ) : null}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Duration</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="number"
                    placeholder="Enter duration"
                    value={editingMovie?.durationValue || ''}
                    onChange={(e) =>
                      setEditingMovie({
                        ...editingMovie!,
                        durationValue: e.target.value, // Update durationValue
                      })
                    }
                  />
                  <Form.Select
                    value={editingMovie?.durationUnit || 'Select'} // Default to 'Minutes'
                    onChange={(e) =>
                      setEditingMovie({
                        ...editingMovie!,
                        durationUnit: e.target.value, // Update durationUnit
                      })
                    }
                  >
                    <option>Select</option>
                    <option value="Minutes">Minutes</option>
                    <option value="Season(s)">Season(s)</option>
                  </Form.Select>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  value={editingMovie?.description || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AuthorizeView>
  );
};

export default ManageMovies;
