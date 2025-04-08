import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AuthorizeView, { AuthorizedUser } from '../components/AuthorizeView';
import Logout from '../components/Logout';

export default function MovieDetail() {
  const { showId } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    axios.get(`/api/movies/${showId}`).then((res) => setMovie(res.data));
  }, [showId]);

  const submitRating = () => {
    axios.post(`/api/ratings`, { showId, rating });
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <AuthorizeView>
      <span>
        <Logout>
          Logout <AuthorizedUser value="email" />
        </Logout>
      </span>
    <div className="p-6">
      <h1 className="text-3xl font-bold">{movie.title}</h1>
      <p>{movie.description}</p>
      <input
        type="number"
        max={5}
        min={1}
        value={rating}
        onChange={(e) => setRating(+e.target.value)}
      />
      <button onClick={submitRating} className="btn-primary ml-2">
        Submit Rating
      </button>
    </div>
    </AuthorizeView>
  );
}
