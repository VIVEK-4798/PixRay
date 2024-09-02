import React, {useState, useEffect} from 'react';
import { MdDownloadForOffline } from 'react-icons/md';
import { Link, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/setup";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import MasonryLayout from './MasonryLayout';
import { pinDetailMorePinQuery, pinDeatilQuery, pinDetailQuery} from '../utils/data';
import Spinner from './Spinner';
import { BiBorderRadius } from 'react-icons/bi';


const PinDetail = ({user}) => {

   const [pins, setPins] = useState(null);
   const [pinDetail, setPinDetail] = useState(null);
   const [comment, setComment] = useState('');
   const [addingComment, setAddingComment] = useState(false);
   const { pinId } = useParams();

   const addComment = async () => {
    if (comment) {
      setAddingComment(true);
      
      const pinDocRef = doc(db, "pins", pinId);
      
      try {
        const pinDoc = await getDoc(pinDocRef);
        const pinData = pinDoc.data();
        
        if (!pinData.comments) {
          await updateDoc(pinDocRef, { comments: [] });
        }
  
        await updateDoc(pinDocRef, {
          comments: arrayUnion({
            comment: comment,
            _key: uuidv4(),
            postedBy: {
              _id: user.googleId,
              userName: user.name,  
              image: user.imageUrl,        
            }
          })
        });
  
        fetchPinDetails();
        setComment('');  
      } catch (error) {
        console.error("Error adding comment: ", error);
      } finally {
        setAddingComment(false); 
      }
    }
  }

  const fetchPinDetails = async () => {
    try {
      const pinDetail = await pinDetailQuery(pinId);
  
      if (pinDetail) {
        setPinDetail(pinDetail);
  
        const morePinsQuery = query(
          collection(db, "pins"),
          where("category", "==", pinDetail.category),
          where("__name__", "!=", pinId) 
        );
  
        const querySnapshot = await getDocs(morePinsQuery);
        const morePins = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id  
        }));
  
        setPins(morePins);
      }
    } catch (error) {
      console.error("Error fetching pin details or related pins: ", error);
    }
  };
  

  useEffect(() => {
    fetchPinDetails();
  }, [pinId])

  if(!pinDetail) return <Spinner message="Loading pin... "/>

  return (
    <>
    <div className='flex xl:flex-row flex-col m-auto bg-white' style={{maxWidth: '1500px', borderRadius:'32px'}}>
      <div className='flex justify-center items-center md:items-start flex-initial'>
      <img 
        src={pinDetail?.image} 
        alt={pinDetail?.title || "Pin Image"} 
        className='rounded-t-3xl rounded-b-lg'
      />
      </div>
      <div className='w-full p-5 flex-1 xl:min-w-629'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2 items-center'>
          <a
                  href={`${pinDetail?.image?.url}?.dl=`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                >
                  <MdDownloadForOffline />
                </a>
          </div>
          <a href={pinDetail.destination} target='blank' rel='noreferrer'>
          {pinDetail.destination}
          </a>
        </div>
        <div>
          <h1 className='text-4xl font-bold break-words mt-3'>
            {pinDetail.title}  
          </h1>
          <p className='mt-3'>{pinDetail.about}</p>
        </div>
        <Link to={`user-profile/${pinDetail.postedBy?._id}`} className="flex gap-2 mt-5 items-center bg-white rounded-lg">
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={user.imageUrl}
          alt="user-profile"
        />
        <p className="font-semibold capitalize">{pinDetail.postedBy?.userName}</p>
      </Link>
      <h2 className='mt-5 text-2xl'>Comments</h2>
      <div className='max-h-370 overflow-y-auto'>
        {pinDetail?.comments?.map((comment, i) => (
          <div className='flex gap-2 mt-5 items-center bg-white rounded-lg' key={i}>
              <img
                src={comment.postedBy.image}
                alt='user-profile'
                className='w-10 h-10 rounded-full cursor-pointer'
              />
              <div className='flex flex-col'>
                <p className='font-bold'>{comment.postedBy.userName}</p>
                <p>{comment.comment}</p>
              </div>
          </div>
        ))}
      </div>
      <div className='flex flex-wrap mt-6 gap-3'>
      <Link to={`user-profile/${pinDetail.postedBy?._id}`}>
        <img
          className="w-10 h-10 rounded-full cursor-pointer"
          src={user.imageUrl}
          alt="user-profile"
        />
      </Link>
      <input 
        className='flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300'
        type='text'
        placeholder='Add a comment'
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        type='button'
        className='bg-red-500 text-white rounded-full px-2 py-2 font-semibold text-base outline-none'
        onClick={addComment}
      >
        {addingComment ? 'Posting the comment...' : 'Post'}
      </button>
      </div>
      </div>
    </div>
    
    {pins?.length > 0 ? (
      <>
        <h2 className='text-center font-bold text-2x mt-8 mb-4'>
          More like this
        </h2>
         <MasonryLayout pins = {pins}/>
      </>
    ): <Spinner message="Loading more pins..."/>}
    </>
  )
}

export default PinDetail