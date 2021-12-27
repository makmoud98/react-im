const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const EXPIRE_TIME = 86400;
const EDIT_TIME = 120;
const ACTIVE_TIME = 5;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

let entities = [];
let users = {};

function getActiveUserCount() {
  let activeUserCount = 0;
  for (let uid in users) {
    let lastPing = users[uid];
    if (getCurrentTime() - lastPing < ACTIVE_TIME) {
      activeUserCount += 1;
    }
  }
  return activeUserCount;
}

function getEntitiesByUID(uid) {
  return entities.filter((entity) => entity.uid == uid);
}

function getLatestEntityByUID(uid) {
  let myEntities = getEntitiesByUID(uid);
  myEntities = myEntities.filter((entity) => entity.inProgress);
  myEntities.sort((a, b) => {
    return a.lastPing - b.lastPing;
  });
  if (myEntities.length > 0) {
    return myEntities[0];
  } else {
    return null;
  }
}

function getCurrentTime() {
  return Math.floor(Date.now() / 1000);
}

setInterval(() => {
  let curentTime = getCurrentTime();
  for (let i in entities) {
    let entity = entities[i];
    if (parseInt(entity.last_ping) < (curentTime - EXPIRE_TIME)) {
      entities[i] = false;
    }
    if (parseInt(entity.last_ping) < (curentTime - EDIT_TIME)) {
      entities[i].inProgress = false;
    }
  }
}, 200)

setInterval(() => {
  console.log('active users: ' + getActiveUserCount());
}, 1000)

app.get('/api/data', (req, res) => {
  let uid = req.query.uid;
  if (typeof uid == 'string') {
    users[uid] = getCurrentTime();
  }
  res.json({entities: entities, activeUserCount: getActiveUserCount()});
});
app.post('/api/data', (req, res) => {
  let uid = req.body.uid;
  let message = req.body.message;
  let x = req.body.position.x;
  let y = req.body.position.y;
  let red = req.body.color.red;
  let green = req.body.color.green;
  let blue = req.body.color.blue;
  let inProgress = req.body.inProgress;

  let entity = getLatestEntityByUID(uid);
  if (entity) {
    entity.position.x = x;
    entity.position.y = y;
    entity.message = message;
    entity.inProgress = inProgress;
    entity.lastPing = getCurrentTime();
  } else {
    let entity = req.body;// todo find a more secure way for this
    entity.lastPing = getCurrentTime();
    entity.inProgress = true;
    entities.push(entity);
  }
  if (message == 'clear!') {
    entities = [];
  }
  if (uid) {
    users[uid] = getCurrentTime();
  }
  res.json({entities: entities})
});

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
