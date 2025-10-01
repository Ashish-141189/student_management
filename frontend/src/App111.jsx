import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");



  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = { name, email, password };

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    const data = await res.json();

    // update UI immediately
    setUsers([...users, data]);

    // clear form
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div>
      <h2>Users</h2>

      {/* form */}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Add User</button>
      </form>

      {/* list */}
      <ul>
        {users.map(u => (
          <li key={u._id}>{u.name} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
