import Login from "./routes/login";
import './App.css';
import {Routes, Route, useNavigate, Link} from "react-router-dom";
import User from "./routes/user";
import Users from "./routes/users";
import {useCookies} from "react-cookie";


function App() {
  const [cookie, _] = useCookies(['vulnera2Token'])
  const navigate = useNavigate();
  function logout() {
    async function postData(url = '', data = {}) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          credentials: "include"
        });
        return response.json();
      } catch (error) {
        throw error;
      }
    }

    postData('http://localhost:3000/logout')
      .then(() => {
        navigate(0)
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
      {cookie.vulnera2Token &&
        <header style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          padding: "0 20px"
        }}>
          <p>Bienvenido/a</p>
          <Link to={"/"}>Inicio</Link>
          <button onClick={logout}>Logout</button>
        </header>
      }
      <div style={{
        padding: "20px"
      }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/users" element={<Users />} />
          <Route path="/:username" element={<User />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
