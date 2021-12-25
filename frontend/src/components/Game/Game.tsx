import React from 'react';

import { WINDOW_WIDTH, WINDOW_HEIGHT, MOVEMENT_MULTIPLIER } from '../../constants';
import Entity from '../../interfaces/Entity';
import Position from '../../interfaces/Position';
import GameService from '../../services/game-service';
import EntityService from '../../services/entity-service';
import './Game.css';

import { uid } from 'uid';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

class InputHandler extends React.Component<{}, { message: string }> {
  game: Game;
  dragStart: Position|null;
  currentStickPos: Position|null;

  constructor(props: any, game: Game) {
    super(props);

    this.game = props.game;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.dragStart = null;
    this.currentStickPos = { x: 0, y: 0 };
    this.state = {message: ''};
  }
  componentDidUpdate() {
    let latestMessage = EntityService.getLatestMessage()
    if (latestMessage && this.state.message == '' && latestMessage.message != '') {
      this.setState({message: latestMessage.message});
    }
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyboard.bind(this));
    this.createJoystick();
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyboard.bind(this));
  }
  handleMouseDown(event: any) {
    let stick = document.getElementById('joystick');
    if (!stick) return;
    stick.style.transition = '0s';
    if (event.changedTouches) {
      this.dragStart = {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY,
      };
      return;
    }
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
    };
  }
  handleMouseMove(event: any) {
    var that = this;
    let stick = document.getElementById('joystick');
    if (!stick) return;
    if (this.dragStart === null) return;
    event.preventDefault();
    if (event.changedTouches) {
      event.clientX = event.changedTouches[0].clientX;
      event.clientY = event.changedTouches[0].clientY;
    }
    const xDiff = event.clientX - this.dragStart.x;
    const yDiff = event.clientY - this.dragStart.y;
    const angle = Math.atan2(yDiff, xDiff);
    const distance = Math.min(20, Math.hypot(xDiff, yDiff));
    const xNew = distance * Math.cos(angle);
    const yNew = distance * Math.sin(angle);
    stick.style.transform = `translate3d(${xNew}px, ${yNew}px, 0px)`;
    this.currentStickPos = { x: xNew, y: yNew };
    let latestMessage = EntityService.getLatestMessage()
    if (latestMessage) {
      latestMessage.position.x += (xNew/20) * MOVEMENT_MULTIPLIER;
      latestMessage.position.y += (yNew/20) * MOVEMENT_MULTIPLIER;
      GameService.update(latestMessage).then(() => that.game.update());
    }
  }
  handleMouseUp(event: any) {
    let stick = document.getElementById('joystick');
    if (!stick) return;
    if (this.dragStart === null) return;
    stick.style.transition = '.2s';
    stick.style.transform = `translate3d(0px, 0px, 0px)`;
    this.dragStart = null;
    this.currentStickPos = { x: 0, y: 0 };
  }
  handleKeyboard(event: any) {
    var that = this;
    let direction: string|boolean = false;
    let moveX: number = 0;
    let moveY: number = 0;
    switch(event.key) {
      case 'ArrowUp':
        moveX = 0;
        moveY = -1;
        direction = 'up';
        break;
      case 'ArrowLeft':
        moveX = -1;
        moveY = 0;
        direction = 'left';
        break;
      case 'ArrowRight':
        moveX = 1;
        moveY = 0;
        direction = 'right';
        break;
      case 'ArrowDown':
        moveX = 0;
        moveY = 1;
        direction = 'down';
        break;
      default:
        return;
    };
    let latestMessage = EntityService.getLatestMessage()
    if (direction && latestMessage) {
      let diffX = (moveX * MOVEMENT_MULTIPLIER);
      let diffY = (moveY * MOVEMENT_MULTIPLIER);
      latestMessage.position.x += diffX;
      latestMessage.position.y += diffY;
      GameService.update(latestMessage).then(() => that.game.update());
    }
  }
  handleChange(event: any) {
    var that = this;
    this.setState({message: event.target.value});
    let latestMessage = EntityService.getLatestMessage()
    if (latestMessage) {
      latestMessage.message = event.target.value;
      GameService.update(latestMessage).then(() => that.game.update());
    } else {
      let uid = this.game.getUID();
      let randomPos = {x: Math.random() * WINDOW_WIDTH, y: Math.random() * WINDOW_HEIGHT};
      let randomColor = {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255};
      let newMessage = EntityService.createMessage(
        uid,
        randomPos.x,
        randomPos.y,
        randomColor.r,
        randomColor.g,
        randomColor.b,
        true,
        event.target.value
      );
      GameService.update(newMessage).then(() => that.game.update());
    }
  }
  handleSubmit(event: any) {
    var that = this;
    let message = EntityService.getLatestMessage();
    if (message) {
      message.inProgress = false;
      GameService.update(message).then(() => {
        that.setState({message: ''});
        that.game.update();
      });
    }
  }
  createJoystick() {
    let stick = document.getElementById('joystick');
    if (!stick) return;
    stick.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    stick.addEventListener('touchstart', this.handleMouseDown);
    document.addEventListener('touchmove', this.handleMouseMove);
    document.addEventListener('touchend', this.handleMouseUp);
  }
  isURL(message: string) {
    return /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/.test(message);
  }
  render() {
    return (
      <div className="input-handler">
        <div className="joystick-container">
          <img className="joystick-img" src={'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKkAAACpCAYAAABQ1R0vAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAU3SURBVHhe7d1PahRBGIbxjEdwI3giQcGFguA6Z3AjuBDceIasBSEuBAVPJLjxCmol3WYy03+qqquq3/q+5wfR1mjPYD9+1d3RmcPFgpfPn/4ZNoGqrr9+n21x8hPEib1MxXrvJ4gTKo5j/b9BoFAzhvrg5keAsJtSmaJQFaYpkxTyDrlT9OrqatgC4lxeXg5baZIjJU5slRprdKTEidJiY406JyVQ1BDbFRdOkLcaKVMUNcX0xSSFvMULp6XKf//6OWwBcR4+ejxsnVu6iGKSQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh6RQh4vR57hzdt3w1acjx/eD1u+5b4cOZFGSI1yjddoibSw0mHO8RQsb+xQSIizVaBB68frEZEO9o6FWOe5j1QtDmI95zpS5RgI9Y7LSHuZVr08z9rcRdrjQfceqqtIez7YnkN1c5+09EF+9ezJsLXs87cfw1YZPd9X5Wb+ghKBxka5pkS0vYbKzfwZWwMNcZYKNCixP29Lv+lItxzM0nGe2rp/T6G6unCKVTPOUy0fq1dmI82ZNFunW67cx/UyTU1Gmhvo3gh1Gsv9PwqBjpSeiwpzkaZOFsUoUp+T9WnqepIqTy0m6h1TkbaeKOHG/NJHS5anqdtJmjupUiJM+bVTmKa3zESaMkm2BJqrRahWp6nrc9JYW6bhsVL78cZdpKlTtEZUqfv0vuybiLTWMldz6tXat8Ul39Uk7XkieZ6mnJPOaHHu2OIxLCDSCS3jIdR13Udq+SZ2Lmt/Jm4mqYVzOq/npSz3J/ZYflnylxEp5BEp5BEp5BEp5BEp5BEp5BEp5BHpiT1umHv+xyMx3ERq4Ya515v+3UfKG3mds/ZnwnI/oeXyy1K/jkhntIiHQOO4irTnczrP/wjFRKS1zsFqTrpa+7Z4ju5uuU+dSDViSt2n5ykacE4aIURVItZS+/HGTKQpy1zuZNoSWO7vTXmuVm/HuZ2kW0KNnYgpv3aK92V+ZO4tclL+E1puPK1Ym6K8RU4G5UnFFL1jLtLUiaIYQ+pzsnouOnI9SUdKoTJBz5mMNGeyKMSR8xysT9HA7CTNDXWPWHMf10OgAcv9hJah7vGXojemI90yaXKnW6yt+/cyRQPzk3TrwSwda4n9eQo0cPF+90HpV5qL/UJAycCDngPNvZnvJtKg95dE7H2C8hWnCD0fZG9L/DFXkQY9HmzPgQbuIg3CQe/hwPfyPGtzGelIOQDivOM60kBtWqk9HwXuIx3tHQdxziPSE61jIc51ru6T5ip9f9VrlNzMbyg1WiblLSKFPL7iBLOIFPKIFPKIFPKIFPKIFPKIFPKIFPKIFPKIFPKIFPJ2ifTPpy9nH8CcppEuBUmsmNMs0tgACRWnmkSaGh6h4hgXTpBXPdLcqcg0xYhJCnlECnlECnlECnnVIz28fjFspcn9fbCHSQp5TSJNnYpMURxrNkljwyNQnGq63IcA5yJc+hx82+WcdAzy+AOYw4UT5BEp5BEp5BEp5BEp5BEp5BEp5BEp5C2+Zn6w9Lr5QAlLr5cfMEkhbzXStcqBLWL6YpJCXlSkTFPUENvV6oXTKS6ksFXq0EuOdESsSJW7Ih/CN7mhArVdf/1+4MIJ8m4macA0hZowRcP3TFLI+z9JA6YpVIxTNLgX6YhYsZfjOEeTkY6IFa1MxXnr4uIvs8cwhbuaqyMAAAAASUVORK5CYII='}/>
          <div id="joystick" className="joystick"></div>
        </div>
        <div className="connect-info">
          <input className="input" type="hidden" onKeyDown={this.handleKeyboard}/>
          <textarea className="input-player-name" value={this.state.message} placeholder={'Enter a message'} onChange={this.handleChange}></textarea>
          <button className="start-btn" onClick={this.handleSubmit}>SUBMIT</button>
        </div>
      </div>
    );
  }
}

class Board extends React.Component {
  game: Game;

  constructor(props: any) {
    super(props);
    this.game = props.game;
  }

  render() {
    let entityList: Entity[] = EntityService.get();
    let entityElements: JSX.Element[] = [];
    for (let i in entityList) {
      let entity: Entity = entityList[i];
      let elementStyle: any = {
        left: entity.position.x.toString() + 'px',
        top: 'calc(20% + ' + entity.position.y.toString() + 'px)',// TODO improve starting pos calculation
        zIndex: i
      };
      let entityElement = <div/>
      if (entity.render) {
        entityElement = entity.render();
      }
      let element = <div key={i} className={`entity ${entity.type}`} style={elementStyle}>{entityElement}</div>
      entityElements.push(element);
    }
    return (
      <div className="board">
        {entityElements}
      </div>
    );
  }
}

class Game extends React.Component {
  entityList: Entity[];
  mounted: boolean;

  constructor(props: any) {
    super(props);
    this.mounted = false;
    this.entityList = [];
    this.state = {};
  }
  componentDidMount() {
    this.mounted = true;
    this.init();
  }
  init() {
    var that = this;
    if (!cookies.get('uid')) {
      cookies.set('uid', uid(25));
    }
    GameService.get().then(() => {
      that.update();
    })
    setInterval(() => {
      GameService.get().then(() => {
        that.update();
      });
    }, 200);
  }
  getUID() {
    let uid = cookies.get('uid');
    if (uid) {
      return uid;
    } else {
      return 'MISSING UID';// TODO
    }
  }
  update() {
    if (this.mounted) {
      this.forceUpdate();
    }
  }
  render() {
    let gameComponentProps = {
      game: this,
    };
    return (
      <div id="container" className="container">
        <InputHandler {...gameComponentProps} />
        <Board {...gameComponentProps} />
      </div>
    );
  }
}

export default Game;
