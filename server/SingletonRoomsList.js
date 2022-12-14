class SingletonRoomsList {
  static getInstance() {
    if (!this._instance) {
      console.log("Created singleton!");
      this._instance = {};
    }
    return this._instance;
  }
  static checkIfThisRoomExists(roomID) {
    return this._instance[roomID] !== undefined;
  }
}

module.exports = { SingletonRoomsList };
