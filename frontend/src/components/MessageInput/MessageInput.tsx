import React from 'react';

import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../../constants';
import EntityService from '../../services/entity-service';
import GameService from '../../services/game-service';
import Game from '../Game/Game';
import Joystick from '../Joystick/Joystick';
import './MessageInput.css';

class MessageInput extends React.Component<{}, { message: string }> {
  game: Game;

  constructor(props: any, game: Game) {
    super(props);

    this.game = props.game;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {message: ''};
  }
  componentDidUpdate() {
    let latestMessage = EntityService.getLatestMessage()
    if (latestMessage && this.state.message === '' && latestMessage.message !== '') {
      this.setState({message: latestMessage.message});
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
        Math.floor(Date.now() / 1000),
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
  render() {
    return (
      <div className="message-input-container overlay">
        <textarea className="input-message" value={this.state.message} placeholder={'Enter a message'} onChange={this.handleChange}></textarea>
        <div className="spacing"></div>
        <Joystick {...{game: this.game}} />
        <div className="spacing"></div>
        <div className="submit-btn-container">
          <button className="submit-btn" onClick={this.handleSubmit}>SUBMIT</button>
        </div>
      </div>
    );
  }
}

export default MessageInput;
