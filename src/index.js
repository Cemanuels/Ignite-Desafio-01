const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find(user => user.username === username);

  if (!userExists) {
    return response.status(404).json({ error: "User not exists!" });
  }

  request.user = userExists;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = { id: uuidv4(), name, username, todos: [] };

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const userIndex = users.indexOf(user);
  const todo = { id: uuidv4(), title, done: false, deadline: new Date(deadline), created_at: new Date() };

  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const userIndex = users.indexOf(user);
  const todoIndex = users[userIndex].todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  users[userIndex].todos[todoIndex].title = title;
  users[userIndex].todos[todoIndex].deadline = deadline;
  
  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }
  
  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;