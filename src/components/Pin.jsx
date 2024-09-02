import React, { useState } from "react";
import { getFirestore, deleteDoc, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { MdDownloadForOffline } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { BsFillArrowUpRightCircleFill } from "react-icons/bs";
import { fetchUser } from "../utils/fetchUser";

const Pin = ({ pin }) => {
  const { postedBy, imageUrl, _id, save, destination, image } = pin;
  const [postHovered, setPostHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = fetchUser();

  const alreadySaved = !!pin?.save?.filter(
    (item) => item.postedBy._id === user.googleId
  )?.length;

  const savePin = async (id) => {
    if (!user || !user.googleId) {
      console.error("Required data is missing. Check user and postedBy properties.");
      return;
    }

    const pinRef = doc(db, "pins", id);

    try {
      await updateDoc(pinRef, {
        save: arrayUnion({
          _key: uuidv4(),
          userId: user.googleId,
        }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Error saving post: ", error);
    }
  };

  const db = getFirestore();

  const deletePin = async (id) => {
    try {
      const pinRef = doc(db, "pins", id);
      await deleteDoc(pinRef);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting pin:", error);
    }
  };

  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${_id}`)}
        className="relative cursor-zoom-in w-auto hover-shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        <img
          className="rounded-lg w-full"
          alt="user-post"
          src={loading ? "https://via.placeholder.com/300?text=Loading..." : image}
          onLoad={() => setLoading(false)}
          style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s ease-in-out" }}
        />

        {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: "100%" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <a
                  href={`${imageUrl?.asset?.url}?.dl=`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                >
                  <MdDownloadForOffline />
                </a>
              </div>
              {alreadySaved ? (
                <button
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                >
                  {save?.length} Saved
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin(_id);
                  }}
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                >
                  Save
                </button>
              )}
            </div>
            <div className="flex justify-between items-center gap-2 w-full">
              {destination && (
                <a
                  href={destination}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white flex items-center gap-2 text-black font-bold p-2 pl-4 pr-4 rounded-full opacity-70 hover:100 hover:shadow-md"
                >
                  <BsFillArrowUpRightCircleFill />
                  {destination.length > 15
                    ? `${destination.slice(0, 15)}...`
                    : destination}
                </a>
              )}
              {postedBy?._id === user.googleId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePin(_id);
                  }}
                  className="bg-white-500 p-2 opacity-70 hover:opacity-100 text-dark font-bold text-base rounded-3xl hover:shadow-md outline-none"
                >
                  <AiTwotoneDelete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-2 items-center">
        <Link
          to={`user-profile/${postedBy?._id}`}
          className="flex gap-2 items-center"
        >
          <img
            className="w-8 h-8 rounded-full object-cover"
            src={
              postedBy?.image ||
              "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
            }
            alt="user-profile"
          />
          <p className="font-semibold capitalize">{postedBy?.userName}</p>
        </Link>
        {postedBy?._id === user.googleId && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deletePin(_id);
            }}
            className="max-sm:block hidden bg-white-500 p-2 opacity-20 hover:opacity-100 text-dark font-bold text-base rounded-3xl hover:shadow-md outline-none"
          >
            <AiTwotoneDelete />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pin;
