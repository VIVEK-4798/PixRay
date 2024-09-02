import React, { useState, useEffect} from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { useParams, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { db } from "../firebase/setup";
import { doc, getDoc} from "firebase/firestore";
import { userCreatedPinsQuery, userQuery, userSavedPinsQuery } from '../utils/data';
import MasonryLayout from './MasonryLayout';
import Spinner from './Spinner';

const randomImage = 'https://picsum.photos/1600/900';

const activeBtnStyles = 'bg-red-500 text-white font-bold p-2 rounded-full w-20 outline-none';
const notActiveBtnStyles = 'bg-primary mr-4 text-black font-bold p-2 rounded-full w-20 outline-none';

const UserProfile = () => {

  const [user, setUser] = useState(null);
  const [pins, setPins] = useState([]);
  const [text, setText] = useState('created');
  const [activeBtn, setActiveBtn] = useState('created');
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", userId); 
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUser(userDoc.data()); 
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchPins = async () => {
      try {
        let data;
        if (text === 'created') {
          data = await userCreatedPinsQuery(userId);
        } else {
          data = await userSavedPinsQuery(userId);
        }
        setPins(data);
      } catch (error) {
        console.error("Error fetching pins: ", error);
      }
    };

    fetchPins();
  }, [text, userId]);

  const logOut  = () => {
    localStorage.clear();

    navigate('/login');
  }
  
  if(!user){
    return <Spinner message="Loading profile..."/>
  }  

  console.log(user);
  

  return (
    <div className='relative pb-2 h-full justify-center items-center'>
      <div className='flex flex-col pb-5'>
        <div className='relative flex flex-col mb-7'>
          <div className='flex flex-col justify-center items-center'>
            <img
              src={randomImage}
              className='w-full h-370 2xl:h-510 shadow-lg object-cover'
              alt='banner-pic'
            />
            <img 
              className='rounded-full w-20 h-20 -mt-10 shadow-xl object-cover'
              src={user.imageUrl}
              alt='user-pic'
            />
            <h1 className='font-bold text-3xl text-center mt-3'>
              {user.name}
            </h1>
            <div className='absolute top-0 z-1 right-0 p-2'>
              {userId === user.googleId && (
                <button
                type="button"
                className="bg-mainColor flex justify-center items-center p-3 rounded-lg cursor-pointer outline-none"
                onClick={logOut}
              >
                <AiOutlineLogout color='red' fontSize={21} />
              </button>
              )}
            </div>
          </div>
          <div className='text-center mb-7'>
              <button
                type='button'
                onClick={(e) => {
                  setText('created');
                  setActiveBtn('created');
                }}
                className={`${activeBtn === 'created' ? activeBtnStyles : notActiveBtnStyles}`}
              >
                Created
              </button>
              <button
                type='button'
                onClick={(e) => {
                  setText('saved');
                  setActiveBtn('saved');
                }}
                className={`${activeBtn === 'saved' ? activeBtnStyles : notActiveBtnStyles}`}
              >
                Saved
              </button>
          </div>
                {pins?.length ? (
                <div className='px-2'>
                  <MasonryLayout pins = {pins}/>
                </div>
                ) : (
                  <div className='flex justify-center font-bold items-center w-full text-xl mt-2'>No Pins Found!</div>
                )}

        </div>
      </div>
    </div>
  )
}

export default UserProfile