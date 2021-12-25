const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001
const EXPIRE_TIME = 86400;
const EDIT_TIME = 120;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

let entities = [];

function getEntitiesByUID(uid) {
    return entities.filter((entity) => entity.uid == uid);
}

function getLatestEntityByUID(uid) {
  let myEntities = getEntitiesByUID(uid);
  myEntities = myEntities.filter((entity) => entity.inProgress);
  myEntities.sort((a, b) => {
    return a.last_ping - b.last_ping;
  });
  if (myEntities.length > 0) {
    return myEntities[0];
  } else {
    return null;
  }
}

function getCurrentTime() {
  return (new Date()).getSeconds();
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

app.get('/api/data', (req, res) => {
  res.json({entities: entities});
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
  } else {
    let entity = req.body;// todo find a more secure way for this
    entity.last_ping = getCurrentTime();
    entity.inProgress = true;
    entities.push(entity);
  }
  if (message == 'clear!') {
    entities = [];
  }
  res.json({entities: entities})
});

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
