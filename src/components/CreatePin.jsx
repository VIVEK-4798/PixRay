import React, { useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import Spinner from './Spinner';
import { categories } from '../utils/data';

const CreatePin = ({ user }) => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(false);
  const [category, setCategory] = useState(null);
  const [imageAsset, setImageAsset] = useState(null);
  const [wrongImageType, setWrongImageType] = useState(false);

  const navigate = useNavigate();

  const uploadImage = (e) => {
    const { type, name } = e.target.files[0];
    const allowedTypes = ['image/png', 'image/svg', 'image/jpeg', 'image/gif', 'image/tiff'];

    if (allowedTypes.includes(type)) {
      setWrongImageType(false);
      setLoading(true);

      const storage = getStorage();
      const storageRef = ref(storage, `images/${name}`);

      const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          console.log('Image upload Error:', error);
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageAsset(downloadURL);
            setLoading(false);
          });
        }
      );
    } else {
      setWrongImageType(true);
    }
  };

  const savePin = async () => {
    if (title && about && destination && imageAsset && category) {
      const db = getFirestore();
      const pinsRef = collection(db, "pins");

      const doc = {
        title,
        about,
        destination,
        image: imageAsset,
        userId: user.googleId,
        postedBy: {
          _id: user.googleId,
          userName: user.name,
          image: user.imageUrl,
        },
        category,
        _createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(pinsRef, doc);
        navigate('/');
      } catch (error) {
        console.error('Error saving document:', error);
      }
    } else {
      setFields(true);
      setTimeout(() => setFields(false), 3000);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
      <div className="flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5 w-full">
        <div className="bg-secondaryColor p-3 flex flex-0.7 w-full">
          <div className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
            {loading && <Spinner />}
            {wrongImageType && <p>Wrong Image Type</p>}
            {!imageAsset ? (
              <label>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center justify-center flex-col">
                    <p className="font-bold text-2xl">
                      <AiOutlineCloudUpload />
                    </p>
                    <p className="text-lg">Click to upload</p>
                  </div>
                  <p className="mt-32 text-gray-400">
                    Use high-quality JPG, SVG, GIF, or TIFF less than 20 MB
                  </p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  onChange={uploadImage}
                  className="w-0 h-0"
                />
              </label>
            ) : (
              <div className="relative h-full">
                <img src={imageAsset} alt="uploaded-pic" className="h-full w-full" />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                  onClick={() => setImageAsset(null)}
                >
                  <MdDelete />
                </button>
                
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-6 lg:pl-5 mt-5 w-full">
          {fields && (
            <p className="text-red-500 text-xl mb-2 transition-all duration-150 ease-in">
              Please fill in all the fields.
            </p>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add your title"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
          />
          {user && (
            <div className="flex gap-2 my-2 items-center bg-white rounded-lg">
              <img src={user.imageUrl} className="w-10 h-10 rounded-full" />
              <p className="font-bold">{user.name}</p>
            </div>
          )}
          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="What is your pin about"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Add a destination link"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          />
          <div className="flex flex-col">
            <div>
              <p className="mb-2 font-semibold text-lg sm:text-xl">Choose Pin Category</p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
              >
                <option value="other" className="bg-white">
                  Select Category
                </option>
                {categories.map((category) => (
                  <option
                    key={category.name}
                    className="text-base border-0 outline-none capitalize bg-white text-black"
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end items-end mt-5">
              <button
                type="button"
                onClick={savePin}
                className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
