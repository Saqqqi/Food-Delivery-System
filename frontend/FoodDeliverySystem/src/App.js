import React from "react";
import "./App.css";
import AppRouter from "./AppRouter.js";
import { ToastProvider } from "./ToastManager";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}
