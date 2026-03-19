import { styles } from "../styles";

export default function AuthForm({
  mode,
  setMode,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  onRegister,
  onLogin,
  message,
  error,
}) {
  const safeRegisterForm = registerForm || {
    email: "",
    username: "",
    password: "",
  };

  const safeLoginForm = loginForm || {
    email: "",
    password: "",
  };

  return (
    <div style={styles.authWrapper}>
      <h1>Мой мессенджер</h1>

      <div style={styles.authSwitch}>
        <button onClick={() => setMode("login")} style={styles.button}>
          Логин
        </button>
        <button onClick={() => setMode("register")} style={styles.button}>
          Регистрация
        </button>
      </div>

      {mode === "register" ? (
        <form onSubmit={onRegister} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={safeRegisterForm.email}
            onChange={(e) =>
              setRegisterForm({
                ...safeRegisterForm,
                email: e.target.value,
              })
            }
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Username"
            value={safeRegisterForm.username}
            onChange={(e) =>
              setRegisterForm({
                ...safeRegisterForm,
                username: e.target.value,
              })
            }
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={safeRegisterForm.password}
            onChange={(e) =>
              setRegisterForm({
                ...safeRegisterForm,
                password: e.target.value,
              })
            }
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Зарегистрироваться
          </button>
        </form>
      ) : (
        <form onSubmit={onLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={safeLoginForm.email}
            onChange={(e) =>
              setLoginForm({
                ...safeLoginForm,
                email: e.target.value,
              })
            }
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={safeLoginForm.password}
            onChange={(e) =>
              setLoginForm({
                ...safeLoginForm,
                password: e.target.value,
              })
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