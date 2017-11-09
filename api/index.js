const express = require('express');
const r = require('rethinkdb');
const socketio = require('socket.io');

const app = express();
const io = socketio.listen(app.listen(4444));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


let connection = null;

io.sockets.on('connection', (socket) => {
  console.log('connected to socket');
});

r.connect( {host: 'localhost', port: 28015}, (err, conn) => {
  r.table('countries').changes().run(conn, (err, cursor) => {
    cursor.each((err, item) => {
      io.emit('countries_updated', item);
    })
  });
  if (err) throw err;
  connection = conn;
});

app.get('/countries', (req, res) => {
  r.table('countries').run(connection, function(err, cursor) {
    if (err) throw err;
    cursor.toArray(function(err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  });
});

app.get('/countries-live', (req, res) => {
  r.table('countries').run(connection, function(err, cursor) {
    if (err) throw err;
    cursor.toArray(function(err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  });
});

app.post('/countries-unique', (req, res) => {
  r.table('countriesUnique').insert(
    r.table('countries').without('id').distinct()
  ).run(connection, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.sendStatus(201);
  })
});

app.get('/countries-unique', (req, res) => {
  r.table('countriesUnique').run(connection, function(err, cursor) {
    if (err) throw err;
    cursor.toArray(function(err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  });
});

app.get('/countries/:id', (req, res) => {
  r.table('countries')
    .get(req.params.id)
    .run(connection, function(err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
  });
});

app.post('/countries/create', (req, res) => {
  const { name } = req.query;

  r.table('countries').insert([{ name }]).run(connection, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.sendStatus(201);
  })
});

app.delete('/countries', (req, res) => {
  r.table('countries')
    .delete()
    .run(connection, (err, result) => {
    if (err) throw err;
    res.sendStatus(204);
  });
});

app.delete('/countries/:id', (req, res) => {
  r.table('countries')
    .get(req.params.id)
    .delete()
    .run(connection, function(err, result) {
      if (err) {
        res.send(err);
      }
      res.sendStatus(204);
    });
});

app.listen(8888, () => console.log('Example app listening on port 8888!'));
