import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

// <img src="foo" onerror="(() => alert('foo'))()" />
export default function UserList() {
  const [cookie, _, removeCookie] = useCookies(['username'])
  let [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookie.username || cookie.username === "undefined") {
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
    getData(`http://localhost:3000/users/${cookie.username}/lists`)
      .then(data => {
        setList(data.response);
      })
      .catch(() => {
      });
    getData(`http://localhost:3000/users/${cookie.username}`)
      .then(data => {
        setName(data.response.name);
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
    setText("");
    postData(`http://localhost:3000/users/${cookie.username}/lists`)
      .then(data => {
        setList([...list, text])
      })
      .catch(() => {
      });
  }

  function deleteElement(id) {
    async function deleteData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text})
      });
      return response.json();
    }
    setText("");
    deleteData(`http://localhost:3000/users/${cookie.username}/lists/${id}`)
      .then(data => {
        navigate(0);
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
    <h2>Hola {name}!</h2>
    <form onSubmit={onSubmit}>
      <label>Item: <input type="text" value={text} onChange={(event) => setText(event.target.value)} name="text"/></label>
      <button>Crear</button>
    </form>
    <ul>
      {list.map(item => <li key={item.id} style={{ marginTop: "10px"}}>
        <div style={{display: "flex"}}>
          <p dangerouslySetInnerHTML={{__html: item.text}}></p>
          <button style={{marginLeft: "10px"}} onClick={() => deleteElement(item.id)}>Eliminar</button>
        </div>
      </li>
      )}
    </ul>
  </div>
}