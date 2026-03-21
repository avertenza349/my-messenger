import { useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "../api/auth";

export function useAuth() {
  const [mode, setMode] = useState("login");

  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    password: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setError("");
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  }

  async function bootstrapAuth() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsAuthLoading(false);
      return null;
    }

    try {
      const user = await loadCurrentUser();
      return user;
    } catch {
      localStorage.removeItem("access_token");
      setCurrentUser(null);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function login(email, password) {
    setError("");
    setMessage("");

    try {
      const result = await loginUser(email, password);
      localStorage.setItem("access_token", result.access_token);

      const user = await loadCurrentUser();
      setMessage("Вход выполнен");
      return user;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function register(data) {
    setError("");
    setMessage("");

    // 🔥 нормализация данных перед отправкой
    const preparedData = {
      ...data,
      first_name: data.first_name?.trim(),
      last_name: data.last_name?.trim(),
      username: data.username?.trim() || null,
    };

    try {
      const result = await registerUser(preparedData);

      const displayName =
        [result.first_name, result.last_name].filter(Boolean).join(" ") ||
        result.username ||
        result.email;

      setMessage(`Пользователь ${displayName} успешно зарегистрирован`);
      setMode("login");
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  function logout() {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
    setMessage("Вы вышли из аккаунта");
  }

  return {
    mode,
    setMode,
    registerForm,
    setRegisterForm,
    loginForm,
    setLoginForm,
    currentUser,
    setCurrentUser,
    error,
    message,
    setError,
    setMessage,
    isAuthLoading,
    loadCurrentUser,
    bootstrapAuth,
    login,
    register,
    logout,
  };
}