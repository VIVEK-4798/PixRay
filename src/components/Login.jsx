import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; 
import shareVideo from "../assets/share.mp4";
import logo from "../assets/LARGE.jpg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/setup";

// Initialize Firestore
const db = getFirestore();

const Login = () => {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      console.log("User authenticated:", user);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const storageRef = ref(storage, `images/${user.uid}.jpg`);
        const imgBlob = await fetch(user.photoURL).then((res) => res.blob());
        await uploadBytes(storageRef, imgBlob);
        const downloadURL = await getDownloadURL(storageRef);

        await setDoc(userDocRef, {
          name: user.displayName,
          googleId: user.uid,
          imageUrl: downloadURL,
        });
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: user.displayName,
          googleId: user.uid,
          imageUrl: user.photoURL,
        })
      );

      navigate("/home");
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_API_TOKEN}>
      <div className="flex justify-start items-center flex-col h-screen">
        <div className="relative w-full h-full">
          <video
            src={shareVideo}
            type="video/mp4"
            loop
            controls={false}
            muted
            autoPlay
            className="w-full h-full object-cover"
          />
          <div className="absolute flex flex-col justify-center items-center top-0 right-0 left-0 bottom-0 bg-blackOverlay">
            <div className="p-5">
              <img src={logo} width="130px" alt="logo" />
            </div>
            <div className="shadow-2xl">
              <button
                type="button"
                className="bg-mainColor flex justify-center items-center p-3 rounded-lg cursor-pointer outline-none"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="mr-4" />
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
