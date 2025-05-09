"use client";
import { useState, useEffect, createContext, useContext } from "react";

// Auth Context (faux login system)
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email) => {
    localStorage.setItem("fakeUser", email);
    setUser(email);
  };

  const logout = () => {
    localStorage.removeItem("fakeUser");
    setUser(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("fakeUser");
    if (savedUser) setUser(savedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Task Manager Component
const Dashboard = () => {
  const { logout, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem(`tasks-${user}`)) || [];
    setTasks(storedTasks);
  }, [user]);

  const saveTasks = (updatedTasks) => {
    localStorage.setItem(`tasks-${user}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const addTask = () => {
    if (!title.trim()) return;
    const newTask = {
      id: Date.now(),
      title,
      status: "incomplete",
      priority,
      createdAt: new Date().toISOString(),
    };
    saveTasks([newTask, ...tasks]);
    setTitle("");
    setPriority("Medium");
  };

  const completeTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status: "complete" } : t
    );
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Active") return task.status !== "complete";
    if (filter === "Completed") return task.status === "complete";
  });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <button onClick={logout} className="text-red-500">
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border p-2"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button onClick={addTask} className="bg-blue-500 text-white px-4 py-2">
          Add
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        {["All", "Active", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border ${
              filter === f ? "bg-blue-500 text-white" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="border p-3 mb-2 flex justify-between items-center"
        >
          <div>
            <h3
              className={`text-lg ${
                task.status === "complete" ? "line-through" : ""
              }`}
            >
              {task.title}
            </h3>
            <p className="text-sm text-gray-500">{task.priority}</p>
          </div>
          <div className="flex gap-2">
            {task.status !== "complete" && (
              <button
                onClick={() => completeTask(task.id)}
                className="bg-green-500 text-white px-2"
              >
                ✔
              </button>
            )}
            <button
              onClick={() => deleteTask(task.id)}
              className="bg-red-500 text-white px-2"
            >
              ✖
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Login Component
const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (email.trim()) login(email);
  };

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h2 className="text-xl mb-4 font-bold">Login to Task Manager</h2>
      <input
        className="border p-2 w-full mb-3"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 w-full"
      >
        Login
      </button>
    </div>
  );
};

// Main Page
export default function Page() {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return <AuthProvider>{user ? <Dashboard /> : <Login />}</AuthProvider>;
}
