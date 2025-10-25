class BotAdapter {
  constructor(db, sock) {
    this.db = db;
    this.sock = sock;
  }

  async processMessage(message) {
    // Lógica de processamento de mensagem adaptada para o domínio imobiliário
    console.log("Processando mensagem no BotAdapter Imobiliário:", message);
    return { reply: "Olá! Como posso ajudar com imóveis hoje?" };
  }
}

export default BotAdapter;

