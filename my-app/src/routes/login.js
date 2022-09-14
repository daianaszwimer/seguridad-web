import {useEffect, useState} from "react";
import md5 from "md5";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

export default function Login() {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [error, setError] = useState("");
  const [cookie, setCookie] = useCookies(['username'])
  const navigate = useNavigate();

  useEffect(() => {
    console.log(cookie.username);
    if (!cookie.username || cookie.username === "undefined") {
      return;
    }
    navigate(`/lists`)
  }, [cookie.username])

  function onSubmit() {
    async function postData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password: md5(password)})
      });
      return response.json();
    }
    setError("");
    postData('http://localhost:3000/login')
      .then(data => {
        let expires = new Date()
        expires.setTime(expires.getTime() + (600 * 1000))
        setCookie('username', data.response.username, { path: '/',  expires})
      })
      .catch(() => {
        setError("El usuario/contraseña es incorrecto")
      });
  }

  return <div>
    <h1>Login</h1>
    <form onSubmit={onSubmit}>
      {error && <p>{error}</p>}
      <label>Usuario: <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} name="username"/></label>
      <label>Contraseña: <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password"/></label>
      <button>Login</button>
    </form>
  </div>
}