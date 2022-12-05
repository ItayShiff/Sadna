class SingletonRoomsList {
    static getInstance() {
      if (!this._instance) {
        console.log("Created singleton!");
        this._instance = {};
      }
      return this._instance;
    }
    // static checkIfThisExerciseAlreadyExistsInCustomExercises(input) {
    //     return storageCustomExercises.contains(input) === true;
    // }
}
    
module.exports = { SingletonRoomsList };