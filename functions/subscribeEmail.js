const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, addDoc } = require("firebase/firestore");
const nodemailer = require("nodemailer");

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

// SMTP configuration for Zoho Mail
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: "service@qorelabs.org",
    pass: "Dolu6214@", // Replace with your Zoho password or app password
  },
});

exports.handler = async (event) => {
  const origin = event.headers.origin;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "http://localhost:3000",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "3600",
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
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Request body is missing" }),
      };
    }

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

    // Email template with HTML and inline CSS
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <img src="https://qorelabs.org/logo.png" alt="Qorelabs Logo" style="width: 150px; margin-bottom: 20px;" />
          <h1 style="color: #8c52ff;">Welcome to Qorelabs!</h1>
          <p style="font-size: 16px;">Thank you for subscribing to Qorelabs. We're thrilled to have you on board!</p>
        </div>
        <div style="padding: 20px;">
          <p>
            Stay tuned for our latest updates, cutting-edge software solutions, and exciting advancements in quantum computing.
          </p>
          <p>
            Visit our <a href="https://qorelabs.org" style="color: #8c52ff; text-decoration: none;">website</a> for more details about what we do.
          </p>
          <p>Thank you,<br/><strong>The Qorelabs Team</strong></p>
        </div>
        <div style="background-color: #333; color: #fff; text-align: center; padding: 10px; font-size: 14px;">
          © 2024 Qorelabs. All Rights Reserved.
        </div>
      </div>
    `;

    // Send a confirmation email using Zoho SMTP
    const mailOptions = {
      from: '"Qorelabs Support" <service@qorelabs.org>', // Sender address and display name
      to: email, // Recipient email
      subject: "Welcome to Qorelabs!",
      html: htmlContent, // HTML content
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Email saved and confirmation email sent successfully!" }),
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
