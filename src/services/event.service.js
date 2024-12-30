class EventService {
  constructor() {
    this.socketService = null;
  }

  setSocketService(service) {
    this.socketService = service;
  }

  emitOrderUpdate(orderNumber, update) {
    if (this.socketService) {
      this.socketService.emitOrderUpdate(orderNumber, update);
    }
  }
}

module.exports = new EventService();
