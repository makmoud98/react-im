// game service
import Message from '../components/Message/Message';
import EntityService from './entity-service';
import Cookies from 'universal-cookie';
const cookies = new Cookies();
var activeUserCount = 0;

const processResponse = (response: any): any[] => {
  if (response && response.activeUserCount) {
    activeUserCount = parseInt(response.activeUserCount);
  }
  if (response && response.entities) {
    return response.entities
  } else {
    return []
  }
}

const update = (message: Message) => {
  const requestMetadata = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uid: message.uid,
      message: message.message,
      color: message.color,
      position: message.position,
      inProgress: message.inProgress
    })
  }
  return fetch("/api/data", requestMetadata).then(res => res.json()).then(processResponse).then((entities) => {
    EntityService.update(entities);
  })
}

const get = () => {
  const requestMetadata = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  let url = '/api/data';
  let uid = cookies.get('uid');
  if (uid) {
    url += '?uid=' + uid;
  }
  return fetch(url, requestMetadata).then(res => res.json()).then(processResponse).then((entities) => {
    EntityService.update(entities);
  })
}

const getActiveUserCount = () => {
  return activeUserCount;
}

const GameService = {
  get: get,
  update: update,
  getActiveUserCount: getActiveUserCount
}

export default GameService;