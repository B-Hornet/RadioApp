/**
 * Seed Script — Populate Firestore with sample schedule data
 * ═══════════════════════════════════════════════════════════
 * Run with: node src/scripts/seedSchedule.js
 *
 * Seeds:
 * - schedule collection with sample DJ slots for each day
 * - users doc for owner account (reebootradio@gmail.com)
 *
 * NOTE: You must create the Firebase Auth user for reebootradio@gmail.com
 * manually in the Firebase Console first, then paste the UID below.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyABtGR_xpkhKskHPJ26_ViVmW_5pALYwp8',
  authDomain: 'livestreamchat-2d575.firebaseapp.com',
  projectId: 'livestreamchat-2d575',
  storageBucket: 'livestreamchat-2d575.firebasestorage.app',
  messagingSenderId: '1087675450210',
  appId: '1:1087675450210:web:f2947f69266b1d400d623b',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ── Owner UID — UPDATE THIS after creating the Auth user in Firebase Console ──
const OWNER_UID = 'LF1G3wKbYHYPw4RUu8iEEoRfJDR2';

// ── Sample schedule data ──────────────────────────────────────────────
const SCHEDULE_DATA = [
  // Monday
  { day: 'MON', startTime: '6 PM', endTime: '8 PM', djName: 'DJ Blaze', showName: 'Monday Kickoff', isLive: false, order: 0 },
  { day: 'MON', startTime: '8 PM', endTime: '10 PM', djName: 'MC Vortex', showName: 'Prime Time Bass', isLive: false, order: 1 },
  { day: 'MON', startTime: '10 PM', endTime: '12 AM', djName: 'DJ Shadow', showName: 'Midnight Frequencies', isLive: false, order: 2 },
  { day: 'MON', startTime: '12 AM', endTime: '2 AM', djName: 'Luna Wave', showName: 'Ambient Hours', isLive: false, order: 3 },

  // Tuesday
  { day: 'TUE', startTime: '6 PM', endTime: '8 PM', djName: 'DJ Nova', showName: 'Turntable Tuesday', isLive: false, order: 0 },
  { day: 'TUE', startTime: '8 PM', endTime: '10 PM', djName: 'MC Vortex', showName: 'Bass Culture', isLive: false, order: 1 },
  { day: 'TUE', startTime: '10 PM', endTime: '12 AM', djName: 'DJ Pulse', showName: 'Night Drive Mix', isLive: false, order: 2 },
  { day: 'TUE', startTime: '12 AM', endTime: '2 AM', djName: 'Luna Wave', showName: 'Ambient Hours', isLive: false, order: 3 },

  // Wednesday
  { day: 'WED', startTime: '6 PM', endTime: '8 PM', djName: 'DJ Blaze', showName: 'Hump Day Heat', isLive: false, order: 0 },
  { day: 'WED', startTime: '8 PM', endTime: '10 PM', djName: 'DJ Shadow', showName: 'Underground Sessions', isLive: false, order: 1 },
  { day: 'WED', startTime: '10 PM', endTime: '12 AM', djName: 'DJ Nova', showName: 'Late Night Vibes', isLive: false, order: 2 },
  { day: 'WED', startTime: '12 AM', endTime: '2 AM', djName: 'DJ Pulse', showName: 'After Dark', isLive: false, order: 3 },

  // Thursday
  { day: 'THU', startTime: '6 PM', endTime: '8 PM', djName: 'MC Vortex', showName: 'Throwback Thursday', isLive: false, order: 0 },
  { day: 'THU', startTime: '8 PM', endTime: '10 PM', djName: 'DJ Blaze', showName: 'Fire Session', isLive: false, order: 1 },
  { day: 'THU', startTime: '10 PM', endTime: '12 AM', djName: 'DJ Shadow', showName: 'Midnight Frequencies', isLive: true, order: 2 },
  { day: 'THU', startTime: '12 AM', endTime: '2 AM', djName: 'Luna Wave', showName: 'Ambient Hours', isLive: false, order: 3 },

  // Friday
  { day: 'FRI', startTime: '6 PM', endTime: '8 PM', djName: 'DJ Nova', showName: 'Friday Frenzy', isLive: false, order: 0 },
  { day: 'FRI', startTime: '8 PM', endTime: '10 PM', djName: 'MC Vortex', showName: 'Prime Time Bass', isLive: false, order: 1 },
  { day: 'FRI', startTime: '10 PM', endTime: '2 AM', djName: 'DJ Shadow', showName: 'The Marathon Set', isLive: false, order: 2 },
  { day: 'FRI', startTime: '2 AM', endTime: '4 AM', djName: 'DJ Pulse', showName: 'After Hours', isLive: false, order: 3 },

  // Saturday
  { day: 'SAT', startTime: '4 PM', endTime: '6 PM', djName: 'DJ Blaze', showName: 'Weekend Warmup', isLive: false, order: 0 },
  { day: 'SAT', startTime: '6 PM', endTime: '8 PM', djName: 'DJ Nova', showName: 'Saturday Sessions', isLive: false, order: 1 },
  { day: 'SAT', startTime: '8 PM', endTime: '12 AM', djName: 'MC Vortex', showName: 'Saturday Night Live', isLive: false, order: 2 },
  { day: 'SAT', startTime: '12 AM', endTime: '4 AM', djName: 'DJ Shadow', showName: 'Midnight Marathon', isLive: false, order: 3 },

  // Sunday
  { day: 'SUN', startTime: '2 PM', endTime: '4 PM', djName: 'Luna Wave', showName: 'Sunday Soul', isLive: false, order: 0 },
  { day: 'SUN', startTime: '4 PM', endTime: '6 PM', djName: 'DJ Pulse', showName: 'Chill Zone', isLive: false, order: 1 },
  { day: 'SUN', startTime: '6 PM', endTime: '8 PM', djName: 'DJ Nova', showName: 'Easy Sunday', isLive: false, order: 2 },
  { day: 'SUN', startTime: '8 PM', endTime: '10 PM', djName: 'DJ Blaze', showName: 'Week Closer', isLive: false, order: 3 },
];

async function seed() {
  // Sign in as owner to get write permissions
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: node src/scripts/seedSchedule.js <password>');
    console.error('  Pass the password for reebootradio@gmail.com');
    process.exit(1);
  }
  console.log('Signing in as reebootradio@gmail.com...');
  await signInWithEmailAndPassword(auth, 'reebootradio@gmail.com', password);
  console.log('Authenticated!\n');

  // Step 1: Create owner user doc FIRST (users rule allows writing own doc)
  console.log('Creating owner user doc...');
  await setDoc(doc(db, 'users', OWNER_UID), {
    email: 'reebootradio@gmail.com',
    role: 'owner',
    displayName: 'Reeboot Radio',
  });
  console.log('Owner user doc created for reebootradio@gmail.com\n');

  // Step 2: Now seed schedule (rules check role == 'owner' which now exists)
  console.log('Seeding schedule...');
  for (const slot of SCHEDULE_DATA) {
    await addDoc(collection(db, 'schedule'), slot);
    console.log(`  Added: ${slot.day} ${slot.startTime} — ${slot.showName}`);
  }
  console.log(`\nSchedule seeded: ${SCHEDULE_DATA.length} slots`);

  console.log('\nDone!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
