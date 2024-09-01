import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCiOWSkA8qpwahyYeMZYY_qFah4E3SePno",
    authDomain: "pixray-c6021.firebaseapp.com",
    projectId: "pixray-c6021",
    storageBucket: "pixray-c6021.appspot.com",
    messagingSenderId: "25995783205",
    appId: "1:25995783205:web:d15cd9e92c9cbb166823cc",
    measurementId: "G-4W6845JZMZ"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth,db,storage };