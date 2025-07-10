import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const userSection = document.getElementById('user-section');
const authSection = document.getElementById('auth-section');
const userEmail = document.getElementById('user-email');
const appSection = document.getElementById('app-section');
const announcementForm = document.getElementById('announcement-form');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const announcementsList = document.getElementById('announcements-list');

// Toggle between login and signup
showSignupBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
  signupForm.style.display = '';
});
showLoginBtn.addEventListener('click', () => {
  signupForm.style.display = 'none';
  loginForm.style.display = '';
});

// Signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    signupForm.reset();
  } catch (error) {
    alert("Signup error: " + error.message);
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginForm.reset();
  } catch (error) {
    alert("Login error: " + error.message);
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

// Announcement form submit
announcementForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (title && content && auth.currentUser) {
    try {
      await addDoc(collection(db, "announcements"), {
        title,
        content,
        author: auth.currentUser.email,
        timestamp: Date.now()
      });
      announcementForm.reset();
    } catch (error) {
      alert("Error adding announcement: " + error.message);
    }
  }
});

// Auth state observer
let unsubscribeAnnouncements = null;
onAuthStateChanged(auth, user => {
  if (user) {
    userSection.style.display = '';
    userEmail.textContent = user.email;
    authSection.style.display = 'none';
    appSection.style.display = '';
    // Subscribe to announcements
    const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
    unsubscribeAnnouncements = onSnapshot(q, (snapshot) => {
      announcementsList.innerHTML = '';
      snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `<h3>${data.title}</h3><p>${data.content}</p><small>by ${data.author || 'Unknown'}</small>`;
        announcementsList.appendChild(li);
      });
    });
  } else {
    userSection.style.display = 'none';
    userEmail.textContent = '';
    authSection.style.display = '';
    appSection.style.display = 'none';
    if (unsubscribeAnnouncements) unsubscribeAnnouncements();
  }
});
