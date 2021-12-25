import Entity from '../interfaces/Entity';
import Color from '../interfaces/Color';
import Message from '../components/Message/Message';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class EntityService {
  entityList: Entity[] = [];
  constructor() {
    this.update = this.update.bind(this);
  }
  
  // todo move this to its own MessageService which uses EntityService
  createMessage(
    uid: string,
    x: number,
    y: number,
    red: number,
    green: number,
    blue: number,
    inProgress: boolean,
    message: string
  ): Message {
    let messageEntity = new Message(x, y, message);
    let color: Color = { red: red, green: green, blue: blue };
    messageEntity.setColor(color);
    messageEntity.setUID(uid);
    messageEntity.inProgress = inProgress;
    this.entityList.push(messageEntity);
    return messageEntity;
  }
  // todo move this to its own MessageService which uses EntityService
  getLatestMessage(): Message|null {
    var uid = cookies.get('uid');
    if (!uid) {
      return null;
    }
    let myMessages = this.get<Message>();
    myMessages = myMessages.filter((message) => message.inProgress);
    myMessages = myMessages.filter((message) => message.uid === uid);
    if (myMessages.length > 0) {
      myMessages.sort((a, b) => {
        return a.lastPing - b.lastPing;
      });
      return myMessages[0];
    } else {
      return null;
    }
  }
  typeFilter<T extends Entity>(a: Entity[], f: (e: Entity) => e is T): T[] {
    const t: T[] = [];
    a.forEach(e => { if (f(e)) t.push(e) });
    return t;
  }
  isMessage<T extends Entity>(e: Entity): e is T {
    return e.constructor.name === 'Message';
  }
  get<T extends Entity> (uid?: string): T[] {
    return this.typeFilter<T>(this.entityList, this.isMessage);
  }
  update(entities: any[]) {
    this.entityList = [];
    for (let i in entities) {
      let entity = entities[i];
      entity.type = 'message'; // TODO hack atm, backend doesnt support sending over type
      switch (entity.type) {
        case 'message':
          this.createMessage(entity.uid, entity.position.x, entity.position.y, entity.color.red, entity.color.green, entity.color.blue, entity.inProgress, entity.message);
          break;
        default:
          console.error('Unsupported entity type: ' + entity.type);
          continue;
      }
    }
  }
}

var service = new EntityService();
export default service;