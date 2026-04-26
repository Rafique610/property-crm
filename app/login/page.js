"use client";
import { useState } from "react";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = async () => {
const res = await fetch("/api/auth/login", {
method: "POST",
body: JSON.stringify({ email, password }),
});

const data = await res.json();

if (res.ok) {
  window.location.href = "/dashboard";
} else {
  alert(data.message);
}

};

return ( <div className="flex flex-col items-center justify-center h-screen"> <h1 className="text-2xl mb-4">Login</h1>

  <input
    className="border p-2 mb-2"
    placeholder="Email"
    onChange={(e) => setEmail(e.target.value)}
  />

  <input
    className="border p-2 mb-2"
    placeholder="Password"
    type="password"
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    onClick={handleLogin}
    className="bg-blue-500 text-white px-4 py-2"
  >
    Login
  </button>
</div>

);
}
