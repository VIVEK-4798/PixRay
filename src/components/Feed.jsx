import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchQuery, feedQuery } from '../utils/data';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';

const Feed = () => {
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState([]);
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchPins = async () => {
      try {
        setLoading(true);

        let data;
        if (categoryId) {
          data = await searchQuery(categoryId); 
        } else {
          data = await feedQuery(); 
        }

        setPins(data); 
      } catch (error) {
        console.error("Error fetching pins: ", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchPins();
  }, [categoryId]);

  if (loading) return <Spinner message="We are adding new ideas to your feed!" />;

  if (!pins.length) return <h2>No Pins Available</h2>;  

  return (
    <div>
      <MasonryLayout pins={pins} />
    </div>
  );
}

export default Feed;
