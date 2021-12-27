import React from 'react';

import GameService from '../../services/game-service';
import './ActiveUsers.css';

class ActiveUsers extends React.Component {
  render() {
    return (
      <div className="active-users-container overlay">
        <div className="active-users-label text">Active Users: {GameService.getActiveUserCount()}</div>
      </div>
    )
  }
}

export default ActiveUsers;