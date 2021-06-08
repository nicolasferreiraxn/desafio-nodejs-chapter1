const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) return response.status(400).json({ error: "User not found"});

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) return response.status(400).json({ error: "User already exists!"});

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoOperation);

  return response.status(201).send(todoOperation)



});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoFind = user.todos.find(todo => todo.id === id);

  if(!todoFind) return response.status(404).json({ error: "Todo not found"})

  todoFind.title = title,
  todoFind.deadline = new Date(deadline);

  return response.status(201).send(todoFind)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFind = user.todos.find(todo => todo.id === id);

  if(!todoFind) return response.status(404).json({ error: "Todo not found"})

  todoFind.done = true;

  return response.status(201).send(todoFind)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFindIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoFindIndex === -1) return response.status(404).json({ error: "Todo not found"})

  user.todos.splice(todoFindIndex, 1)

  return response.status(204).json()
});

module.exports = app;