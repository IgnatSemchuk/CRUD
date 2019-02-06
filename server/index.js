
const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data.json');
const db = low(adapter);

const app = express();
const port = 8080;

app.use(express.json());

app.get('/users', (req, res) => {
    res.send(db.get('users'));
});

app.post('/users', (req, res) => {
    const user = req.body;

    if (!user.name || user.name <= 0) {
        res.status(400);
        res.send('None shall pass');
    }
    db.get('users')
      .push(user)
      .write();
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});