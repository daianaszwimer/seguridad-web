import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
// import { decode } from "jsonwebtoken";  
// import { useLocation } from 'react-router-dom';

// <img src="foo" onerror="(() => alert('foo'))()" />
export default function UserList() {

  const [cookie, _, removeCookie] = useCookies(['vulnera2Token'])
  let [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  
    if (!cookie.vulnera2Token || cookie.vulnera2Token === "undefined") {
      navigate("/login");
    }

    // let decoded = decode(cookie.vulnera2Token);
    // console.log('decoded', decoded)

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

    getData(`http://localhost:3000/users/${"manu"}/lists`)
      .then(data => {
        setList(data.response);
      })
      .catch((err) => {
        console.log(err)
      });

    getData(`http://localhost:3000/users/${"manu"}`)
      .then(data => {
        setName(data.response.username);
      })
      .catch((err) => {
        console.log(err)
      });
  }, [cookie.vulnera2Token])

  function onSubmit() {
    async function postData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text}),
        credentials: "include"
      });
      return response.json();
    }
    
    setText("");

    postData(`http://localhost:3000/users/${"manu"}/lists`)
      .then(data => {
        setList([...list, text])
      })
      .catch((error) => {
        console.log("fallo", error, error.status);
      });
  }

  function deleteElement(id) {
    async function deleteData(url = '', data = {}) {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text}),
        credentials: "include"

      });
      return response.json();
    }
    setText("");
    deleteData(`http://localhost:3000/users/${"manu"}/lists/${id}`)
      .then(data => {
        navigate(0);
      })
      .catch(() => {
      });
  }

  return <div>
    <button onClick={() => {
      removeCookie("vulnera2Token")
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