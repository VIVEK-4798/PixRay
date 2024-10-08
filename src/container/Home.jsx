import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/setup"; 
import { HiMenu } from 'react-icons/hi';
import { Link, Routes, Route } from 'react-router-dom';

import { Sidebar, UserProfile } from '../components';
import Pins from './Pins';
import pin from '../components/Pin';
import logo from '../assets/LARGE-Black.png';
import { AiFillCloseCircle } from 'react-icons/ai';

const Home = () => {
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const scrollRef = useRef(null);

  const userInfo = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userInfo?.googleId) { 
          const userDocRef = doc(db, "users", userInfo.googleId);
          
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUser(userDoc.data());
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }, []);

  useEffect(() => {
    scrollRef.current.scrollTo(0,0)
  }, [])

  return (
    <div className='flex bg-gray-50 md:flex-row flex-col h-screen transaction-height duration-75 ease-out'>
      <div className='hidden md:flex h-screen flex-initial'>
        <Sidebar user={user && user}/>
      </div>
      <div className='flex md:hidden flex-row'>
        <div className='p-2 w-full flex flex-row justify-between items-center shadow-md'>
        <HiMenu fontSize={40} className='cursor-pointer' onClick={() => setToggleSidebar(true)} />
        <Link to="/">
          <img src={logo} alt='logo' className='w-28' />
        </Link>
        {user && (
          <Link to={`user-profile/${userInfo.googleId}`}>
            <img src={user.imageUrl} alt={`${user.name}'s profile`} className='w-12 rounded-full' />
          </Link>
        )}
        </div>
      {toggleSidebar && (
        <div className='fixed w-4/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in'>
            <div className='absolute w-full flex justify-end items-center p-2'>
              <AiFillCloseCircle fontSize={30} className='cursor-pointer' onClick={() => setToggleSidebar(false)}/>
            </div>
            <Sidebar user={user && user} closeToggle={setToggleSidebar}/>
        </div>
      )}
      </div>
      <div className='pb-2 flex-1 h-screen overflow-y-scroll' ref={scrollRef}>
        <Routes>
          <Route path='/user-profile/:userId' element={<UserProfile/>}/>
          <Route path='/*' element={<Pins user={user && user} pin = {pin}/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default Home;
