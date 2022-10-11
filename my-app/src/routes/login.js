import {useEffect, useState} from "react";
import md5 from "md5";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

export default function Login() {
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [error, setError] = useState("");
  const [cookie, _] = useCookies(['username'])
  const navigate = useNavigate();

  useEffect(() => {
    console.log(cookie.username);
    if (!cookie.username || cookie.username === "undefined") {
      return;
    }
    navigate(`/lists`)
  }, [cookie.username])

  function onSubmit(event) {
    event.preventDefault()
    async function postData(url = '', data = {}) {
      try {

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password: md5(password)}),
        credentials: "include"
      });
      return response.json();
      } catch (error) {
       throw error;
      }
    }
    setError("");
    postData('http://localhost:3000/login')
      .then(data => {

      })
      .catch((error) => {
        console.log(error);
        console.log(error.status);
        setError("El usuario/contraseña es incorrecto")
      });
  }

  return <div>
    <h1>Login</h1>
    <form onSubmit={onSubmit} method="POST">
      {error && <p>{error}</p>}
      <label>Usuario: <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} name="username"/></label>
      <label>Contraseña: <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password"/></label>
      <button>Login</button>
    </form>
  </div>
}