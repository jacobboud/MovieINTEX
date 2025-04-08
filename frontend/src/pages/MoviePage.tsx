import { useEffect, useState } from 'react';
import axios from 'axios';

interface CarouselItem {
  title: string;
  showId: string;
  description: string;
  imageUrl: string;
}

interface Carousel {
  title: string;
  items: CarouselItem[];
}

export default function MoviePage() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const userId = 1; // Replace with actual auth-based user ID

  useEffect(() => {
    axios
      .get(`https://localhost:5000/Movie/carousels/${userId}`)
      .then((res) => setCarousels(res.data))
      .catch((err) => console.error('Failed to load carousels:', err));
  }, [userId]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">For JACOB</h1>

      {carousels.map((carousel) => (
        <div key={carousel.title} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{carousel.title}</h2>
          <div className="flex gap-4 overflow-x-auto">
            {carousel.items.map((item) => (
              <div key={item.showId} className="min-w-[160px]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="rounded-md w-full h-[240px] object-cover mb-2"
                />
                <p className="text-sm font-medium truncate">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
