import Position from './Position';

interface Entity {
  type: string,
  position: Position,
  lastPing: number,
  render?: Function,
  tick?: Function
};

export default Entity;