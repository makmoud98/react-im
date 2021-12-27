import React from 'react';

import Entity from '../../interfaces/Entity';
import GameService from '../../services/game-service';
import Board from '../Board/Board';
import ActiveUsers from '../ActiveUsers/ActiveUsers';
import Toolbar from '../Toolbar/Toolbar';
import './Game.css';

import { uid } from 'uid';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

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
        <ActiveUsers />
        <Board {...gameComponentProps} />
        <Toolbar {...gameComponentProps} />
      </div>
    );
  }
}

export default Game;
