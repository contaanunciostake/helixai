class MessageTracker {
  constructor(db) {
    this.db = db;
    this.conversations = new Map(); // Para armazenar o estado da conversa
  }

  async trackMessage(message) {
    // Lógica de rastreamento de mensagens
    console.log("Rastreando mensagem:", message);
    // Implementar lógica de persistência se necessário
  }

  async getConversationState(clientId) {
    return this.conversations.get(clientId) || {};
  }

  async updateConversationState(clientId, state) {
    this.conversations.set(clientId, state);
  }
}

export default MessageTracker;

