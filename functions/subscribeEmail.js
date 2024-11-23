const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, addDoc } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIVPwlAT6OnfcIpauao2fVitipkWbVg0w",
  authDomain: "qorelabs-7678c.firebaseapp.com",
  projectId: "qorelabs-7678c",
  storageBucket: "qorelabs-7678c.firebasestorage.app",
  messagingSenderId: "984555589967",
  appId: "1:984555589967:web:cad72686d6221a80a5b53a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

exports.handler = async (event) => {
  try {
    // Parse email from request body
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email is required" }),
      };
    }

    // Check if email already exists
    const emailsRef = collection(db, "emails");
    const q = query(emailsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email already exists" }),
      };
    }

    // Save the email to Firestore
    await addDoc(emailsRef, { email });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email saved successfully!" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};
