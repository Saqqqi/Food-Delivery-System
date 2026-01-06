import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons from react-icons

export function LoginForm() {
    const [error, setError] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const staticEmail = "food123@gmail.com";
        const staticPassword = "food123";

        if (email === staticEmail && password === staticPassword) {
            const token = "food123";
            localStorage.setItem("food123", token);
            navigate("/admin/dashboard");
        } else {
            setError("Invalid credentials, please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-yellow-100">
            <div className="w-full max-w-md p-10 space-y-8 bg-black rounded-xl shadow-2xl">
                <h2 className="text-3xl font-extrabold text-center text-yellow-400">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="text-red-400 text-center mb-4">{error}</div>
                    )}
                    <div>
                        <input
                            type="text"
                            id="email"
                            placeholder="Email Address"
                            className="w-full px-5 py-3 border border-yellow-500 rounded-md text-black bg-yellow-100 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div className="relative">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            id="password"
                            placeholder="Password"
                            className="w-full px-5 py-3 border border-yellow-500 rounded-md text-black bg-yellow-100 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? (
                                <FaEyeSlash className="text-yellow-500" />
                            ) : (
                                <FaEye className="text-yellow-500" />
                            )}
                        </button>
                    </div>
                    <div className="text-yellow-300">
                        <p><strong>Email:</strong> food123@gmail.com</p>
                        <p><strong>Password:</strong> food123</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 text-black font-bold bg-yellow-400 rounded-md hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;