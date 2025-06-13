import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaTasks } from "react-icons/fa";

const Dashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "" });
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTasks();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/tasks", newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks([...tasks, res.data]);
      setNewTask({ title: "", description: "", dueDate: "" });
    } catch (err) {
      setError("Failed to create task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch {
      setError("Failed to delete task.");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const res = await axios.patch(`/tasks/${task._id}`, { isCompleted: !task.isCompleted }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch {
      setError("Update failed.");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "overdue") return t.dueDate && new Date(t.dueDate) < new Date();
    if (filter === "upcoming") return t.dueDate && new Date(t.dueDate) >= new Date();
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <FaTasks className="text-indigo-600" /> Dashboard
        </h1>
        <button onClick={handleLogout} className="bg-gray-100 text-sm px-4 py-2 rounded hover:bg-gray-200">
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create Task</h2>
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Title"
            className="border rounded p-2 w-full"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            className="border rounded p-2 w-full"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add</button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
        <div className="mb-4">
          <label className="mr-2">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">All</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500">No tasks found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm"
              >
                <div className="flex-1">
                  <p className={`font-medium ${task.isCompleted ? "line-through text-gray-400" : ""}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`px-2 py-1 text-xs rounded ${
                      task.isCompleted ? "bg-green-200" : "bg-yellow-200"
                    }`}
                  >
                    {task.isCompleted ? "Undo" : "Complete"}
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
