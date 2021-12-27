import React from 'react';

import EntityService from '../../services/entity-service';
import Game from '../Game/Game';
import Entity from '../../interfaces/Entity';
import './Board.css';

class Board extends React.Component {
  game: Game;

  constructor(props: any) {
    super(props);
    this.game = props.game;
  }

  render() {
    let entityList: Entity[] = EntityService.get();
    let entityElements: JSX.Element[] = [];
    let sortedEntityList = entityList.sort((a, b) => a.lastPing - b.lastPing);
    for (let i in sortedEntityList) {
      let entity: Entity = sortedEntityList[i];
      let elementStyle: any = {
        left: entity.position.x.toString() + 'px',
        top: 'calc(20% + ' + entity.position.y.toString() + 'px)',// TODO improve starting pos calculation
        zIndex: i
      };
      let entityElement = <div/>
      if (entity.render) {
        entityElement = entity.render();
      }
      let element = <div key={i} className="entity" style={elementStyle}>{entityElement}</div>
      entityElements.push(element);
    }
    return (
      <div className="board">
        {entityElements}
      </div>
    );
  }
}

export default Board;