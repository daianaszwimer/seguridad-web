import Login from "./routes/login";
import UserList from "./routes/user-list";
import './App.css';
import { Routes, Route, Link } from "react-router-dom";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/lists" element={<UserList />} />
    </Routes>
  );
}

export default App;
