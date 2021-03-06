import React from 'react';
import Entity from '../../interfaces/Entity';
import Color from '../../interfaces/Color';
import Position from '../../interfaces/Position';
import './Message.css';

class Message extends React.Component implements Entity {
  uid?: string;
  message: string = "";
  color: Color = { red: 0, green: 0, blue: 0};
  position: Position = { x: 0, y: 0 };
  lastPing: number = 0;
  type: string = "message";
  inProgress: boolean = true;

  constructor(x: number, y: number, message?: string) {
    super({});
    this.position.x = x;
    this.position.y = y;
    this.color = { red: 0, green: 0, blue: 0 };
    this.message = '';

    if (message) {
      this.setMessage(message);
    }
  }
  setUID(uid: string) {
    this.uid = uid;
  }
  setMessage(message: string) {
    this.message = message;
  }
  setColor(color: Color) {
    this.color = color;
  }
  isImage(message: string) {
    return /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/.test(message);
  }
  render() {
    let messageStyle = {
      backgroundColor: 'rgb(' + this.color.red.toString() + ', ' + this.color.green.toString() + ', ' + this.color.blue.toString() + ')'
    };
    if (this.isImage(this.message)) {
      return <img className="message message-image" alt="message" src={this.message}/>
    } else {
      let message = this.message.split('\n').join('<br/>');
      return <div className="message" style={messageStyle} dangerouslySetInnerHTML={{__html: message}}></div>
    }
  }
};

export default Message;