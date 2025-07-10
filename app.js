// Your Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyCJAC5sLEwHu2cWN8emsd5ZPkoHBdGfZHs",
  authDomain: "ssc-announcements.firebaseapp.com",
  projectId: "ssc-announcements",
  storageBucket: "ssc-announcements.firebasestorage.app",
  messagingSenderId: "389054350744",
  appId: "1:389054350744:web:1826a9102e7db316b6d7ed",
  measurementId: "G-9H6C10MK78"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI Elements
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const announcementSection = document.getElementById('announcement-section');
const announcementInput = document.getElementById('announcement-input');
const postBtn = document.getElementById('post-btn');
const announcementsList = document.getElementById('announcements-list');

// Authentication logic
loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};
logoutBtn.onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  if (user) {
    userInfo.textContent = `Signed in as: ${user.displayName}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    announcementSection.style.display = 'block';
  } else {
    userInfo.textContent = '';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    announcementSection.style.display = 'none';
  }
});

// Posting announcements
postBtn.onclick = async () => {
  const text = announcementInput.value.trim();
  if (!text) return;
  const user = auth.currentUser;
  await db.collection('announcements').add({
    text,
    user: user.displayName,
    uid: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  announcementInput.value = '';
};

// Real-time announcements display
db.collection('announcements').orderBy('timestamp', 'desc')
  .onSnapshot(snapshot => {
    announcementsList.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `<span class="username">${data.user}:</span> ${data.text}
        <span class="timestamp">
          ${data.timestamp ? data.timestamp.toDate().toLocaleString() : ''}
        </span>`;
      announcementsList.appendChild(li);
    });
  });
