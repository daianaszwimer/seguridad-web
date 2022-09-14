import Login from "./routes/login";
import UserList from "./routes/user-list";
import './App.css';
import { Routes, Route } from "react-router-dom";
import Admin from "./routes/admin";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/lists" element={<UserList />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
