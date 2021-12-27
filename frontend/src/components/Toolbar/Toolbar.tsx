import React from 'react';

import Game from '../Game/Game';
import MessageInput from '../MessageInput/MessageInput';
import './Toolbar.css';

class Toolbar extends React.Component {
  game: Game;

  constructor(props: any, game: Game) {
    super(props);
    this.game = props.game;
  }
  render() {
    return (
      <div className="toolbar overlay">
        <MessageInput {...{game: this.game}} />
      </div>
    );
  }
}

export default Toolbar;