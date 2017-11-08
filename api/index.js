const express = require('express');
const r = require('rethinkdb');
const app = express();

let connection = null;

r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
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

app.get('/countries/:id', (req, res) => {
  r.table('countries')
    .get(req.params.id)
    .run(connection, function(err, result) {
      if (err) {
        res.send(err);
      }
      console.log(JSON.stringify(result, null, 2));
      res.send(result);
  });
});

app.post('/countries/create', (req, res) => {
  const { name } = req.query;

  r.table('countries').insert([{ name }]).run(connection, (err, result) => {
    if (err) {
      res.send(err);
    }
    console.log(JSON.stringify(result, null, 2));
    res.sendStatus(201);
  })
});

app.delete('/countries', (req, res) => {
  r.table('countries')
    .delete()
    .run(connection, (err, result) => {
    if (err) throw err;
    console.log(JSON.stringify(result, null, 2));
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
      console.log(JSON.stringify(result, null, 2));
      res.sendStatus(204);
    });
});


app.listen(8888, () => console.log('Example app listening on port 8888!'));
