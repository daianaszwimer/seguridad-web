import {useEffect, useState} from "react";
import md5 from "md5";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

export default function Login() {
  
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");
  let [error, setError] = useState("");
  const [cookie, _] = useCookies(['vulnera2Token'])
  const navigate = useNavigate();

  useEffect(() => {
    console.log("cookie.vulnera2Token", cookie.vulnera2Token);
    if (!cookie.vulnera2Token || cookie.vulnera2Token === "undefined") {
      return;
    }

    async function getData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });
      return response.json();
    }

    getData(`http://localhost:3000/users/current`)
      .then(data => {
        if (data.response.username) {
          navigate(data.response.username);
        }
      })
      .catch((err) => {
        console.log(err)
      });

  }, [cookie.vulnera2Token, navigate])

  function onSubmit(event) {
    event.preventDefault()
    
    async function postData(url = '', data = {}) {
      try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({username, password: password/*md5(password)*/}),
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
        console.log(data)
        if (data.ok) {
          navigate(0)
        } else {
          setError("El usuario/contraseña es incorrecto")
        }
      })
      .catch((error) => {
        console.log(error);
        console.log(error.status);
        setError("El usuario/contraseña es incorrecto")
      });
  }

  return <div>
    <h1>Login</h1>
    <form onSubmit={onSubmit} method="POST" style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }}>
      {error && <p>{error}</p>}
      <label>Usuario: <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} name="username"/></label>
      <label>Contraseña: <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} name="password"/></label>
      <button style={{width: "fit-content"}}>Login</button>
    </form>
  </div>
}