// game service
import Message from '../components/Message/Message';
import EntityService from './entity-service';

const processResponse = (response: any): any[] => {
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
  return fetch("/api/data", requestMetadata).then(res => res.json()).then(processResponse).then((entities) => {
    EntityService.update(entities);
  })
}

const GameService = {
  get: get,
  update: update
}

export default GameService;