import React, { useState } from 'react';
import Modal from 'react-modal'; 
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom'; // React Router for navigation
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Recharts for bar charts
import './App.css'; // CSS file

// TaskMaster Statistics Page
const StatsPage = ({ tasks }) => {
  const totalTasks = tasks.length; // Total tasks
  const completedTasks = tasks.filter(task => task.complete).length; // Completed tasks
  const incompleteTasks = totalTasks - completedTasks; // Incomplete tasks
  const highPriorityTasks = tasks.filter(task => task.priority === 'High').length; // High priority tasks
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'Medium').length; // Medium priority tasks
  const lowPriorityTasks = tasks.filter(task => task.priority === 'Low').length; // Low priority tasks

  const priorityData = [
    { name: 'High', tasks: highPriorityTasks },
    { name: 'Medium', tasks: mediumPriorityTasks },
    { name: 'Low', tasks: lowPriorityTasks }
  ]; // Priority data

  const completionData = [
    { name: 'Completed', tasks: completedTasks },
    { name: 'Incomplete', tasks: incompleteTasks }
  ]; // Completion data

  return (
    <div>
      <h1>Task Statistics</h1>
      {/* Display statistics */}
      <div>
        <p>Total tasks: {totalTasks}</p>
        <p>Completed tasks: {completedTasks}</p>
        <p>Incomplete tasks: {incompleteTasks}</p>
        <p>High priority tasks: {highPriorityTasks}</p>
        <p>Medium priority tasks: {mediumPriorityTasks}</p>
        <p>Low priority tasks: {lowPriorityTasks}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
        {/* Priority bar charts */}
        <BarChart width={400} height={300} data={priorityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" fill="#8884d8" />
        </BarChart>
        {/* Completion bar chart */}
        <BarChart width={400} height={300} data={completionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="tasks" fill="#82ca9d" />
        </BarChart>
      </div>
    </div>
  );
};

// Navigation button to switch between tasks and statistics
const NavigationButton = () => {
  const location = useLocation();
  if (location.pathname === "/stats") {
    return <Link to="/" className="button">View Tasks</Link>;
  } else {
    return <Link to="/stats" className="button">View Stats</Link>;
  }
};

// Main App component
const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  }); // Tasks state
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [currentTask, setCurrentTask] = useState(null); // Current task state
  const [searchTerm, setSearchTerm] = useState(''); // Search term state
  const [sortType, setSortType] = useState('none'); // Sort type state
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a.complete !== b.complete) {
      return a.complete ? 1 : -1;
    } else if (sortType === 'priority') {
      return a.priority.localeCompare(b.priority);
    } else if (sortType === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  }); // Filtered and sorted tasks

  const openModal = (task = { id: null, title: '', description: '', priority: 'Medium', complete: false }) => {
    setCurrentTask(task);
    setModalIsOpen(true);
  }; // Open modal with task data

  const closeModal = () => {
    setModalIsOpen(false);
  }; // Close modal

  const addOrUpdateTask = (task) => {
    const updatedTasks = task.id ? tasks.map(t => (t.id === task.id ? {...t, ...task} : t)) : [...tasks, {...task, id: Date.now(), complete: false}];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    closeModal();
  }; // Add or update task

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    closeModal();
  }; // Delete task

  const toggleCompleteTask = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? {...task, complete: !task.complete} : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  }; // Toggle task completion

  return (
    <Router>
      <div className="app">
        {/* Header and buttons */}
        <h1 className="header">TaskMaster</h1>
        <button className="button" onClick={() => openModal()}>Add Task</button>
        <NavigationButton />
        {/* Search and sort inputs */}
        <input
          type="text"
          className="search"
          placeholder="Search tasks..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="sort" onChange={(e) => setSortType(e.target.value)}>
          <option value="none">No Sorting</option>
          <option value="priority">Sort by Priority</option>
          <option value="alphabetical">Sort Alphabetically</option>
        </select>
        <Routes>
          <Route path="/stats" element={<StatsPage tasks={tasks} />} />
          <Route path="/" element={
            <div className="taskList">
              {filteredTasks.map((task) => (
                <div key={task.id} className={task.complete ? "taskComplete" : "task"}>
                  <h3 className="taskHeader">{task.title}</h3>
                  <p className="taskDescription">{task.description}</p>
                  <span className="taskPriority">{task.priority}</span>
                  <button className="button" onClick={() => toggleCompleteTask(task.id)}>
                    {task.complete ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button className="button" onClick={() => openModal(task)}>Edit</button>
                </div>
              ))}
            </div>
          } />
        </Routes>
        {/* Modal and task form */}
        {modalIsOpen && (
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="modalContent"
            overlayClassName="modalOverlay"
          >
            <TaskForm task={currentTask} onSave={addOrUpdateTask} onDelete={deleteTask} onCancel={closeModal} />
          </Modal>
        )}
      </div>
    </Router>
  );
};

// Task form component
const TaskForm = ({ task, onSave, onDelete, onCancel }) => {
  const [title, setTitle] = useState(task.title); // Title state
  const [description, setDescription] = useState(task.description); // Description state
  const [priority, setPriority] = useState(task.priority); // Priority state
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({...task, title, description, priority});
  }; // Form submit handler

  // Display task form
  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
      />
      <textarea
        className="textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <select
        className="select"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button className="button" type="submit">Save Task</button>
      {task.id && (
        <button className="deleteButton" onClick={() => onDelete(task.id)}>Delete Task</button>
      )}
      <button className="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default App;
