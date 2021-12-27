import React from 'react';
import { MOVEMENT_MULTIPLIER } from '../../constants';
import GameService from '../../services/game-service';
import EntityService from '../../services/entity-service';
import Position from '../../interfaces/Position';
import Game from '../Game/Game';
import './Joystick.css';

class Joystick extends React.Component {
  game: Game;
  dragStart: Position|null;
  currentStickPos: Position|null;

  constructor(props: any, game: Game) {
    super(props);
    this.game = props.game;
    this.dragStart = null;
    this.currentStickPos = { x: 0, y: 0 };
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyboard);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchmove', this.handleMouseMove);
    document.addEventListener('touchend', this.handleMouseUp);
    let stick = document.getElementById('joystick');
    if (!stick) return;
    stick.addEventListener('mousedown', this.handleMouseDown);
    stick.addEventListener('touchstart', this.handleMouseDown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyboard);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('touchmove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchend', this.handleMouseUp);
    let stick = document.getElementById('joystick');
    if (!stick) return;
    stick.removeEventListener('mousedown', this.handleMouseDown);
    stick.removeEventListener('touchstart', this.handleMouseDown);
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
  render() {
    return (
      <div className="joystick-container unselectable overlay">
        <img className="joystick-img unselectable" alt="joystick" src='/joystick3.png' />
        <div id="joystick" className="joystick unselectable overlay"></div>
      </div>
    );
  }
}

export default Joystick;