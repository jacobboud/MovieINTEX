import React, { useEffect, useState } from 'react';
import { Button, Table, Form, Modal, Pagination } from 'react-bootstrap';
import { Movie } from '../types/Movie'; // adjust path if needed

const ManageMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Partial<Movie> | null>(null);

  useEffect(() => {
    fetch('/api/AllMovies')
      .then((res) => res.json())
      .then((data) => setMovies(data));
  }, []);

  const totalPages = Math.ceil(movies.length / pageSize);
  const currentMovies = movies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      setMovies(movies.filter((m) => m.show_id !== id));
    }
  };

  const handleSave = () => {
    if (!editingMovie) return;

    if ('show_id' in editingMovie && editingMovie.show_id) {
      setMovies(
        movies.map((m) =>
          m.show_id === editingMovie.show_id ? (editingMovie as Movie) : m
        )
      );
    } else {
      const newMovie: Movie = {
        ...editingMovie,
        show_id: Date.now(),
        // Default genre flags to false
        action: false,
        adventure: false,
        animeSeries: false,
        britishSeries: false,
        children: false,
        comedies: false,
        internationalComedyDramas: false,
        internationalComedies: false,
        romanticComedies: false,
        crimeTVShowsDocuseries: false,
        documentaries: false,
        internationalDocumentaries: false,
        docuseries: false,
        dramas: false,
        internationalDramas: false,
        romanticDramas: false,
        family: false,
        fantasy: false,
        horror: false,
        internationalThrillers: false,
        internationalTVRomanticDramas: false,
        kids: false,
        language: false,
        musicals: false,
        natureTV: false,
        realityTV: false,
        spirituality: false,
        actionTV: false,
        comedyTV: false,
        dramaTV: false,
        talkShowTVComedies: false,
        thrillers: false,
      } as Movie;
      setMovies([...movies, newMovie]);
    }

    setShowModal(false);
    setEditingMovie(null);
  };

  return (
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
                    setEditingMovie(movie);
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

      <Pagination>
        {Array.from({ length: totalPages }, (_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={idx + 1 === currentPage}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingMovie?.show_id ? 'Edit Movie' : 'Add Movie'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {[
              { label: 'Title', field: 'title' },
              { label: 'Type', field: 'type' },
              { label: 'Director', field: 'director' },
              { label: 'Cast', field: 'cast' },
              { label: 'Country', field: 'country' },
              { label: 'Rating', field: 'rating' },
              { label: 'Duration', field: 'duration' },
              { label: 'Description', field: 'description' },
            ].map(({ label, field }) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  value={(editingMovie?.[field as keyof Movie] as string) || ''}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie!,
                      [field]: e.target.value,
                    })
                  }
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Release Year</Form.Label>
              <Form.Control
                type="number"
                value={editingMovie?.release_year || ''}
                onChange={(e) =>
                  setEditingMovie({
                    ...editingMovie!,
                    release_year: parseInt(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Genres</Form.Label>
              <div className="row">
                {[
                  'action',
                  'adventure',
                  'animeSeries',
                  'britishSeries',
                  'children',
                  'comedies',
                  'internationalComedyDramas',
                  'internationalComedies',
                  'romanticComedies',
                  'crimeTVShowsDocuseries',
                  'documentaries',
                  'internationalDocumentaries',
                  'docuseries',
                  'dramas',
                  'internationalDramas',
                  'romanticDramas',
                  'family',
                  'fantasy',
                  'horror',
                  'internationalThrillers',
                  'internationalTVRomanticDramas',
                  'kids',
                  'language',
                  'musicals',
                  'natureTV',
                  'realityTV',
                  'spirituality',
                  'actionTV',
                  'comedyTV',
                  'dramaTV',
                  'talkShowTVComedies',
                  'thrillers',
                ].map((genreKey) => (
                  <div className="col-md-4" key={genreKey}>
                    <Form.Check
                      type="radio"
                      name="genre"
                      label={genreKey
                        .replace(/([A-Z])/g, ' $1') // Adds spaces before capital letters
                        .replace(/^./, (str) => str.toUpperCase()) // Capitalizes the first letter
                        .replace(/([A-Za-z]+)TV/, '$1 TV')} // Properly handles 'TV' by ensuring a space before 'TV'
                      checked={editingMovie?.[genreKey as keyof Movie] === true}
                      onChange={() =>
                        setEditingMovie({
                          ...editingMovie!,
                          [genreKey]: true,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
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
  );
};

export default ManageMovies;
