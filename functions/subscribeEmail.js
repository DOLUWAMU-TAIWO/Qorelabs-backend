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

// Allowed origins
const allowedOrigins = ["http://localhost:3000", "https://qorelabs.org"];

exports.handler = async (event) => {
  // Get the origin of the request
  const origin = event.headers.origin;

  // Check if the origin is allowed
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "3600", // Cache preflight response for 1 hour
  };

  // Handle preflight OPTIONS requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    // Ensure the request body exists
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Request body is missing" }),
      };
    }

    // Parse the request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Invalid JSON format", error: error.message }),
      };
    }

    // Extract email from the parsed body
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Email is required" }),
      };
    }

    // Check if the email already exists in Firestore
    const emailsRef = collection(db, "emails");
    const q = query(emailsRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Email already exists" }),
      };
    }

    // Save the email to Firestore
    await addDoc(emailsRef, { email });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Email saved successfully!" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};
