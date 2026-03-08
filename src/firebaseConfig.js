// Firebase configuration for LivestreamChat project
// Project: LivestreamChat (livestreamchat-2d575)
// App: reebootchat
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyABtGR_xpkhKskHPJ26_ViVmW_5pALYwp8',
  authDomain: 'livestreamchat-2d575.firebaseapp.com',
  databaseURL: 'https://livestreamchat-2d575-default-rtdb.firebaseio.com',
  projectId: 'livestreamchat-2d575',
  storageBucket: 'livestreamchat-2d575.firebasestorage.app',
  messagingSenderId: '1087675450210',
  appId: '1:1087675450210:web:f2947f69266b1d400d623b',
  measurementId: 'G-9XVS8BJ70S',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, database, auth };

