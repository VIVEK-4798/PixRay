import { getFirestore, doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore"; 

export const categories = [
  {
    name: 'cars',
    image: 'https://i.pinimg.com/750x/eb/47/44/eb4744eaa3b3ccd89749fa3470e2b0de.jpg',
  },
  {
    name: 'fitness',
    image: 'https://i.pinimg.com/236x/25/14/29/251429345940a47490cc3d47dfe0a8eb.jpg',
  },
  {
    name: 'wallpaper',
    image: 'https://i.pinimg.com/236x/03/48/b6/0348b65919fcbe1e4f559dc4feb0ee13.jpg',
  },
  {
    name: 'websites',
    image: 'https://i.pinimg.com/750x/66/b1/29/66b1296d36598122e6a4c5452b5a7149.jpg',
  },
  {
    name: 'photo',
    image: 'https://i.pinimg.com/236x/72/8c/b4/728cb43f48ca762a75da645c121e5c57.jpg',
  },
  {
    name: 'food',
    image: 'https://i.pinimg.com/236x/7d/ef/15/7def15ac734837346dac01fad598fc87.jpg',
  },
  {
    name: 'nature',
    image: 'https://i.pinimg.com/236x/b9/82/d4/b982d49a1edd984c4faef745fd1f8479.jpg',
  },
  {
    name: 'art',
    image: 'https://i.pinimg.com/736x/f4/e5/ba/f4e5ba22311039662dd253be33bf5f0e.jpg',
  }, {
    name: 'travel',
    image: 'https://i.pinimg.com/236x/fa/95/98/fa95986f2c408098531ca7cc78aee3a4.jpg',
  },
  {
    name: 'quotes',
    image: 'https://i.pinimg.com/236x/46/7c/17/467c17277badb00b638f8ec4da89a358.jpg',
  }, {
    name: 'cats',
    image: 'https://i.pinimg.com/236x/6c/3c/52/6c3c529e8dadc7cffc4fddedd4caabe1.jpg',
  }, {
    name: 'dogs',
    image: 'https://i.pinimg.com/236x/1b/c8/30/1bc83077e363db1a394bf6a64b071e9f.jpg',
  },
  {
    name: 'anime',
    image: 'https://4kwallpapers.com/images/walls/thumbs_3t/6478.jpg',
  },
  {
    name: 'sports',
    image: 'https://pbs.twimg.com/profile_images/1502569716371447810/aDO4Mn-O_400x400.jpg',
  },
  {
    name: 'others',
    image: 'https://i.pinimg.com/236x/2e/63/c8/2e63c82dfd49aca8dccf9de3f57e8588.jpg',
  },
];

const db = getFirestore();

export const getUserData = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

export const searchQuery = async (searchTerm) => {
  const pinsRef = collection(db, "pins");
  const searchTermLower = searchTerm.trim().toLowerCase(); // Normalize input

  const titleQuery = query(
    pinsRef,
    where("title", ">=", searchTermLower),
    where("title", "<=", searchTermLower + "\uf8ff")
  );

  const categoryQuery = query(
    pinsRef,
    where("category", ">=", searchTermLower),
    where("category", "<=", searchTermLower + "\uf8ff")
  );

  const aboutQuery = query(
    pinsRef,
    where("about", ">=", searchTermLower),
    where("about", "<=", searchTermLower + "\uf8ff")
  );

  const [titleSnapshot, categorySnapshot, aboutSnapshot] = await Promise.all([
    getDocs(titleQuery),
    getDocs(categoryQuery),
    getDocs(aboutQuery),
  ]);

  const pins = [];

  titleSnapshot.forEach((doc) => {
    pins.push({ ...doc.data(), _id: doc.id });
  });

  categorySnapshot.forEach((doc) => {
    if (!pins.some((pin) => pin._id === doc.id)) {
      pins.push({ ...doc.data(), _id: doc.id });
    }
  });

  aboutSnapshot.forEach((doc) => {
    if (!pins.some((pin) => pin._id === doc.id)) {
      pins.push({ ...doc.data(), _id: doc.id });
    }
  });

  return pins;
};




export const feedQuery = async () => {
  const pinsRef = collection(db, "pins");
  
  const q = query(pinsRef, orderBy("_createdAt", "desc"));

  try {
      const querySnapshot = await getDocs(q);
      const pins = [];

      querySnapshot.forEach((doc) => {
          const data = doc.data();
          pins.push({
              ...data,
              _id: doc.id,
              postedBy: {
                  _id: data.postedBy._id,
                  userName: data.postedBy.userName,
                  image: data.postedBy.imageUrl,
              },
              save: Array.isArray(data.save) ? data.save.map((saveItem) => ({
                  _key: saveItem._key,
                  postedBy: saveItem.postedBy ? {
                      _id: saveItem.postedBy._id,
                      userName: saveItem.postedBy.userName,
                      image: saveItem.postedBy.imageUrl,
                  } : {
                      _id: 'user123', // Provide a default or handle undefined cases
                  },
              })) : [],
          });
      });

      return pins;
  } catch (error) {
      console.error("Error fetching pins: ", error);
      return [];
  }
};


  export const pinDetailQuery = async (pinId) => {
    const pinRef = doc(db, "pins", pinId);
    const pinDoc = await getDoc(pinRef);
  
    if (!pinDoc.exists()) {
      return null;
    }
  
    const pinData = pinDoc.data();
  
    const pinDetail = {
      _id: pinDoc.id,
      image: pinData.image || null,
      title: pinData.title,
      about: pinData.about,
      category: pinData.category,
      destination: pinData.destination,
      postedBy: {
        _id: pinData.postedBy?._id,
        userName: pinData.postedBy?.userName,
        image: pinData.postedBy?.image,
      },
      save: pinData.save?.map(saveItem => ({
        postedBy: {
          _id: saveItem.postedBy?._id,
          userName: saveItem.postedBy?.userName,
          image: saveItem.postedBy?.image,
        },
      })) || [],
      comments: pinData.comments?.map(commentItem => ({
        comment: commentItem.comment,
        _key: commentItem._key,
        postedBy: {
          _id: commentItem.postedBy?._id,
          userName: commentItem.postedBy?.userName,
          image: commentItem.postedBy?.image,
        },
      })) || [],
    };
  
    return pinDetail;
  };
  
  export const pinDetailMorePinQuery = async (pin) => {
    const pinsRef = collection(db, "pins");
    
    const q = query(
      pinsRef,
      where("category", "==", pin.category),
      where("_id", "!=", pin._id)
    );
  
    const querySnapshot = await getDocs(q);
    const pins = querySnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
      image: doc.data().image?.asset?.url || null,
      destination: doc.data().destination,
      postedBy: {
        _id: doc.data().postedBy._id,
        userName: doc.data().postedBy.userName,
        image: doc.data().postedBy.image,
      },
      save: doc.data().save?.map(saveItem => ({
        _key: saveItem._key,
        postedBy: {
          _id: saveItem.postedBy._id,
          userName: saveItem.postedBy.userName,
          image: saveItem.postedBy.image,
        },
      })) || [],
    }));
    return pins ;
  };

  export const userQuery = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      return null;
    }
  };
  
  export const userCreatedPinsQuery = async (userId) => {
    try {
      const pinsRef = collection(db, "pins");
  
      const q = query(pinsRef, where("userId", "==", userId), orderBy("_createdAt", "desc"));
  
      const querySnapshot = await getDocs(q);
  
      const pins = querySnapshot.docs.map(doc => {
        const pinData = doc.data();
        return {
          _id: doc.id,
          image: pinData.image || null, // Assuming the URL is stored directly in the image object
          destination: pinData.destination,
          postedBy: {
            _id: pinData.postedBy?._id,
            userName: pinData.postedBy?.userName,
            image: pinData.postedBy?.image,
          },
          save: pinData.save?.map(saveItem => ({
            postedBy: {
              _id: saveItem.postedBy?._id,
              userName: saveItem.postedBy?.userName,
              image: saveItem.postedBy?.image,
            },
          })) || [],
        };
      });
  
      return pins;
    } catch (error) {
      console.error("Error fetching pins: ", error);
      return [];
    }
  };
  
  export const userSavedPinsQuery = async (userId) => {
    try {
      const pinsRef = collection(db, "pins");
  
      const q = query(pinsRef, orderBy("_createdAt", "desc"));
  
      const querySnapshot = await getDocs(q);
  
      const pins = querySnapshot.docs
        .map(doc => {
          const pinData = doc.data();
          return {
            _id: doc.id,
            image: pinData.image?.url || null, 
            destination: pinData.destination,
            postedBy: {
              _id: pinData.postedBy?._id,
              userName: pinData.postedBy?.userName,
              image: pinData.postedBy?.image,
            },
            save: pinData.save?.map(saveItem => ({
              postedBy: {
                _id: saveItem.postedBy?._id,
                userName: saveItem.postedBy?.userName,
                image: saveItem.postedBy?.image,
              },
            })) || [],
          };
        })
        .filter(pin => pin.save.some(saveItem => saveItem.postedBy?._id === userId));
  
      return pins;
    } catch (error) {
      console.error("Error fetching saved pins: ", error);
      return [];
    }
  };