require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const users = [];
const exercises = [];

app.route('/api/users')
.get((req, res) => {
  res.json(users);
})
.post((req, res) => {
  let user = {
    username: req.body.username,
    _id     : "" + users.length
  };
  users.push(user);
  res.json(user);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let p = parseInt(req.params._id);
  let date = req.body.date ? req.body.date : Date.now();
  let exercise = {
    username   : users[p].username,
    description: req.body.description,
    duration   : parseInt(req.body.duration),
    date       : new Date(date),
    _id        : users[p]._id
  };
  exercises.push(exercise);
  res.json({
    _id        : users[p]._id,
    username   : users[p].username,
    date       : new Date(date).toDateString(),
    duration   : parseInt(req.body.duration),
    description: req.body.description
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  let user = users[parseInt(req.params._id)];

  let from = req.query.from  ? new Date(req.query.from).valueOf() : undefined;
  let to   = req.query.to    ? new Date(req.query.to  ).valueOf() : undefined;
  let limit= req.query.limit ? parseInt(req.query.limit) : undefined;

  let result = {
    _id     : user._id,
    username: user.username,
    count   : 0,
    log     : []
  };

  exercises.every((e) => {
    if (e._id == user._id) {
      let valid = true;
      if (from && e.date.valueOf() < from) valid = false;
      if (to   && e.date.valueOf() > to  ) valid = false;
      if (valid) {
        result.count++;
        result.log.push({
          description: e.description,
          duration   : e.duration,
          date       : e.date.toDateString(),
        })
      }
    }
    if (limit && result.count >= limit) return false;
    else return true;
  });

  res.json(result);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
