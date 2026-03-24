import { useEffect, useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "./api/auth";

export default function App() {
  const [mode, setMode] = useState("login");
  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setError("");
    } catch {
      setCurrentUser(null);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await registerUser(registerForm);
      setMessage(`Пользователь ${result.username} успешно зарегистрирован`);
      setMode("login");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await loginUser(loginForm.email, loginForm.password);
      localStorage.setItem("access_token", result.access_token);
      await loadCurrentUser();
      setMessage("Вход выполнен");
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
    setMessage("Вы вышли из аккаунта");
  }

  if (currentUser) {
    return (
      <div style={styles.container}>
        <h1>Мой мессенджер</h1>
        <p>Ты вошёл как: <b>{currentUser.username}</b></p>
        <p>Email: {currentUser.email}</p>
        <p>Подтверждён: {currentUser.is_verified ? "Да" : "Нет"}</p>

        <button onClick={handleLogout} style={styles.button}>
          Выйти
        </button>

        {message && <p style={styles.success}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Мой мессенджер</h1>

      <div style={styles.switcher}>
        <button onClick={() => setMode("login")} style={styles.button}>
          Логин
        </button>
        <button onClick={() => setMode("register")} style={styles.button}>
          Регистрация
        </button>
      </div>

      {mode === "register" ? (
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, email: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Username"
            value={registerForm.username}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, username: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, password: e.target.value })
            }
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Зарегистрироваться
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Войти
          </button>
        </form>
      )}

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "420px",
    margin: "40px auto",
    padding: "24px",
    border: "1px solid #ccc",
    borderRadius: "12px",
    fontFamily: "Arial, sans-serif",
    background: "#fff",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "20px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  switcher: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  success: {
    color: "green",
    marginTop: "16px",
  },
  error: {
    color: "red",
    marginTop: "16px",
  },
};