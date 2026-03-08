// Firebase configuration for LivestreamChat project
// Project: LivestreamChat (livestreamchat-2d575)
// App: reebootchat
// Using Cloud Firestore (existing collections: Chatrooms, Messages, Users)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyABtGR_xpkhKskHPJ26_ViVmW_5pALYwp8',
  authDomain: 'livestreamchat-2d575.firebaseapp.com',
  projectId: 'livestreamchat-2d575',
  storageBucket: 'livestreamchat-2d575.firebasestorage.app',
  messagingSenderId: '1087675450210',
  appId: '1:1087675450210:web:f2947f69266b1d400d623b',
  measurementId: 'G-9XVS8BJ70S',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

