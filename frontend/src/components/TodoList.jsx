import React, { useState, useEffect } from 'react';

function TodoList({ token, API_URL }) {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setTodos(data);
        } else {
          console.error('Error: Received HTML instead of JSON.');
        }
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!task) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task }),
      });
      if (response.ok) {
        const newTodo = await response.json();
        setTodos(prevTodos => [...prevTodos, newTodo]);
        setTask('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed }),
      });
      const updatedTodo = await response.json();
      setTodos(todos.map(t => (t.id === id ? updatedTodo : t)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id, todo.completed)} style={{ cursor: 'pointer', textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.task}
            </span>
            <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: '10px' }}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default TodoList;