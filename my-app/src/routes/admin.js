import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
// <img src="foo" onerror="(() => alert('foo'))()" />
export default function Admin() {
  const [cookie, _, removeCookie] = useCookies(['username'])
  let [list, setList] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookie.username || cookie.username === "undefined" || cookie.username !== "admin") {
      alert("No tenes acceso!");
      navigate("/login");
    }
    async function getData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    }
    getData(`http://localhost:3000/lists`)
      .then(data => {
        setList(data.response);
      })
      .catch(() => {
      });
    getData(`http://localhost:3000/users`)
      .then(data => {
        setUsers(data.response);
      })
      .catch(() => {
      });
  }, [cookie.username])
  function onSubmit() {
    async function postData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text})
      });
      return response.json();
    }
    postData(`http://localhost:3000/users/${user}/lists`)
      .then(data => {
        setList([...list, text])
        setText("");
      })
      .catch(() => {
      });
  }

  return <div>
    <button onClick={() => {
      removeCookie("username")
      navigate("/login")
    }}>Logout</button>
    <h1>User List</h1>
    <h2>Admin panel</h2>
    <form onSubmit={onSubmit}>
      <label>Item: <input type="text" value={text} onChange={(event) => setText(event.target.value)} name="text"/></label>
      <select name="select" value={user} onChange={(event) => setUser(event.target.value)}>
        {users.map(user => <option value={user.username}>{user.name}</option>)}
      </select>
      <button>Crear</button>
    </form>
    <ul>
      {list.map((item, index) => <li key={`${item.text}-${index}`}>
        <p dangerouslySetInnerHTML={{__html: item.text}}></p>
      </li>)}
    </ul>
  </div>
}