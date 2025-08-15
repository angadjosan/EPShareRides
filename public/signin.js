import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  OAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

import config from "./config.js";
const firebaseApp = initializeApp(config);

const auth = getAuth();

const signInButton = document.getElementById('sign-in')

async function toggleSignIn() {
  if (!auth.currentUser) {
    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.setCustomParameters({
        tenant: 'eastsideprep.org',
      });

      provider.addScope('User.Read');
      
      // Ensure popup opens immediately
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        const idToken = await result.user.getIdToken(/* forceRefresh */ false);
        const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `idToken=${idToken}; Path=/; SameSite=Lax${secureAttr}`;
        
        const response = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
        });
        
        if (response.ok) {
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Don't silently catch errors - let user know something went wrong
    }
  } else {
    signOut(auth);
  }
}

onAuthStateChanged(auth, function (user) {
  // Something could happen here
});

// Use mousedown instead of click to ensure immediate response
signInButton.addEventListener('mousedown', (e) => {
  e.preventDefault();
  toggleSignIn();
}, false);