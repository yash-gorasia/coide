// Save service for file operations
export const saveService = {
  saveCallbacks: [],

  // Register a callback for when room is being left
  onRoomLeave(callback) {
    this.saveCallbacks.push(callback);
  },

  // Trigger all save callbacks
  async triggerRoomLeaveSave() {
    for (const callback of this.saveCallbacks) {
      try {
        await callback();
      } catch (error) {
        console.error('Error during auto-save on room leave:', error);
      }
    }
    // Clear callbacks after use
    this.saveCallbacks = [];
  }
};