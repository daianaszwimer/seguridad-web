import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

export default function Users() {
  const [cookie, _] = useCookies(['vulnera2Token'])
  const navigate = useNavigate();
  const [users, setUsers] = useState([])
  useEffect(() => {
    if (!cookie.vulnera2Token || cookie.vulnera2Token === "undefined") {
      navigate("/");
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

    getData(`http://localhost:3000/users`)
      .then(data => {
        console.log(data);
        setUsers(data.response);
      })
      .catch((err) => {
        console.log(err)
      });
  }, [cookie.vulnera2Token])

  return (
    <div>
      <h1>Los usuarios que existen son:</h1>
      <ul>
        {users.map(user => <li key={user.id}>
          {user.name}
        </li>)}
      </ul>
    </div>
  )
}