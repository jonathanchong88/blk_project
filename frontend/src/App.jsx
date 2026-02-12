import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [view, setView] = useState('todos'); // 'todos' or 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageList, setImageList] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  useEffect(() => {
    if (view === 'upload' && token) {
      fetchImages();
    }
  }, [view, token]);

  const auth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginView ? '/api/login' : '/api/signup';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (isLoginView) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
        } else {
          alert('Signup successful! Please login.');
          setIsLoginView(true);
        }
        setUsername('');
        setPassword('');
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          alert(data.message);
        } catch {
          alert('Request failed: ' + response.status + ' ' + response.statusText);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setTodos([]);
    setView('todos');
  };

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
          console.error('Error: Received HTML instead of JSON. Please restart your server to apply the proxy settings.');
        }
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const fetchImages = async () => {
    setLoadingImages(true);
    try {
      const response = await fetch('/api/upload', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setImageList(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoadingImages(false);
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

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: reader.result,
            filename: file.name
          }),
        });
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('Server returned invalid response');
        }

        if (response.ok) {
          setUploadedImageUrl(data.url);
          fetchImages();
        } else {
          alert(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error(error);
        alert('Upload error: ' + error.message);
      } finally {
        setUploading(false);
      }
    };
  };

  if (!token) {
    return (
      <div className="App">
        <h1>{isLoginView ? 'Login' : 'Sign Up'}</h1>
        <form onSubmit={auth} className="auth-form">
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit">{isLoginView ? 'Login' : 'Sign Up'}</button>
        </form>
        <button className="link-btn" onClick={() => setIsLoginView(!isLoginView)}>
          {isLoginView ? 'Need an account? Sign Up' : 'Have an account? Login'}
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Todo List</h1>
        <div>
          <button onClick={() => setView('todos')} style={{ marginRight: '10px' }}>Todos</button>
          <button onClick={() => setView('upload')} style={{ marginRight: '10px' }}>Upload Image</button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      {view === 'todos' ? (
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
      ) : (
        <div className="upload-section">
          <h2>Upload Image</h2>
          <input type="file" onChange={handleUpload} disabled={uploading} />
          {uploading && <p>Uploading...</p>}
          {uploadedImageUrl && (
            <div style={{ marginTop: '20px' }}>
              <p>Upload Successful!</p>
              <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '300px' }} />
            </div>
          )}

          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h3>Your Gallery</h3>
            {loadingImages ? (
              <p>Loading gallery...</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                {imageList.map((img) => (
                  <img key={img.name} src={img.url} alt={img.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;