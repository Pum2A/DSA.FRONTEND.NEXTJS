"use client";
import { useState, useEffect } from "react";
import api from "../lib/api";

export default function TestCors() {
  const [result, setResult] = useState<string>("Testowanie CORS...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Proste żądanie GET do testowania CORS
    fetch("http://localhost:5178/api/auth/user", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        setResult(`Fetch GET status: ${res.status} ${res.statusText}`);
      })
      .catch((err) => {
        setError(`Fetch error: ${err.message}`);
      });
  }, []);

  const testPost = () => {
    // Test żądania POST z CORS
    api
      .post("/auth/register", {
        email: "test@example.com",
        userName: "testuser",
        password: "Test123!",
        firstName: "Test",
        lastName: "User",
      })
      .then((res) => {
        setResult(`POST status: ${res.status} - ${JSON.stringify(res.data)}`);
      })
      .catch((err) => {
        setError(`POST error: ${err.message}`);
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test CORS</h1>
      <div>
        <p>Wynik: {result}</p>
        {error && <p style={{ color: "red" }}>Błąd: {error}</p>}
      </div>
      <button onClick={testPost}>Test POST /register</button>
    </div>
  );
}
