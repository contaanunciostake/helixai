/**
 * 📅 MÓDULO DE AGENDAMENTO DE VISITAS
 *
 * Sistema completo de agendamento com notificação ao lojista
 * e aprovação/recusa de visitas
 */

import { createLogger } from './logger.js';

const log = createLogger('AGENDAMENTO');

export class GerenciadorAgendamentos {
  constructor(db, sock) {
    this.db = db;
    this.sock = sock;
    this.agendamentosPendentes = new Map(); // telefone_lojista -> [agendamentos]
  }

  /**
   * Cria novo agendamento quando cliente confirma horário
   */
  async criarAgendamento(dados) {
    const {
      clienteTelefone,
      clienteNome,
      imovelId,
      imovelEndereco,
      imovelPreco,
      dataAgendamento,
      horaAgendamento,
      tipoInteresse = 'visita_loja',
      valorEntrada = null,
      numeroParcelas = null,
      valorParcela = null,
      temImovelTroca = false,
      imovelTroca = null,
      observacoes = null
    } = dados;

    try {
      log.info(`📅 Criando agendamento para ${clienteNome}...`);

      // 1. BUSCAR LOJISTA DO VEÍCULO
      const lojista = await this.buscarLojistaDoImovel(imovelId);

      if (!lojista) {
        log.error(`❌ Imóvel ${imovelId} não tem lojista vinculado!`);
        return {
          sucesso: false,
          erro: 'Imóvel sem lojista vinculado',
          mensagem: 'Não consegui identificar o vendedor responsável por este imóvel. Entre em contato diretamente com a loja.'
        };
      }

      log.info(`✅ Lojista encontrado: ${lojista.nome} (${lojista.telefone})`);

      // 2. INSERIR AGENDAMENTO NO BANCO
      const [result] = await this.db.execute(`
        INSERT INTO agendamentos_visitas (
          cliente_telefone, cliente_nome,
          imovel_id, imovel_endereco, imovel_preco,
          lojista_telefone, lojista_nome,
          data_agendamento, hora_agendamento,
          tipo_interesse, status,
          valor_entrada, numero_parcelas, valor_parcela,
          tem_imovel_troca,
          imovel_troca_tipo, imovel_troca_endereco, imovel_troca_ano, imovel_troca_valor_estimado,
          observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clienteTelefone, clienteNome,
        imovelId, imovelEndereco, imovelPreco,
        lojista.telefone, lojista.nome,
        dataAgendamento, horaAgendamento,
        tipoInteresse,
        valorEntrada, numeroParcelas, valorParcela,
        temImovelTroca,
        imovelTroca?.tipo, imovelTroca?.endereco, imovelTroca?.ano, imovelTroca?.valorEstimado,mado,
        observacoes
      ]);

      const agendamentoId = result.insertId;
      log.success(`✅ Agendamento #${agendamentoId} criado com sucesso!`);

      // 3. DISPARAR NOTIFICAÇÃO AO LOJISTA
      await this.notificarLojista(agendamentoId, lojista, dados);

      // 4. REGISTRAR LOG
      await this.registrarMensagem(agendamentoId, 'bot', 'lojista',
        `Novo agendamento #${agendamentoId} criado`);

      return {
        sucesso: true,
        agendamentoId: agendamentoId,
        lojista: lojista,
        mensagem: `Agendamento confirmado! O vendedor ${lojista.nome} receberá a solicitação em instantes.`
      };

    } catch (error) {
      log.error('[AGENDAMENTO] Erro ao criar:', error);
      return {
        sucesso: false,
        erro: error.message,
        mensagem: 'Erro ao processar agendamento. Tente novamente ou entre em contato direto com a loja.'
      };
    }
  }

  /**
   * Busca lojista responsável pelo veículo
   */
  async buscarLojistaDoImovel(imovelId) {
    try {
      const [rows] = await this.db.execute(`
        SELECT
          lojista_telefone as telefone,
          lojista_nome as nome
        FROM properties
        WHERE id = ?
      `, [imovelId]);

      if (rows.length === 0 || !rows[0].telefone) {
        // Fallback: usar lojista padrão da configuração
        return {
          telefone: process.env.LOJA_TELEFONE || '5567999887766',
          nome: process.env.LOJA_NOME || 'Feirão ShowCar - Vendas'
        };
      }

      return rows[0];

    } catch (error) {
      log.error('[LOJISTA] Erro ao buscar:', error);
      return null;
    }
  }

  /**
   * Notifica lojista sobre novo agendamento
   */
  async notificarLojista(agendamentoId, lojista, dados) {
    try {
      log.info(`📲 Enviando notificação ao lojista ${lojista.telefone}...`);

      // Formatar mensagem
      const mensagem = this.formatarMensagemLojista(agendamentoId, dados);

      // Enviar mensagem
      await this.sock.sendMessage(lojista.telefone, {
        text: mensagem
      });

      log.success(`✅ Notificação enviada ao lojista!`);

      // Registrar log
      await this.registrarMensagem(agendamentoId, 'bot', 'lojista',
        `Novo agendamento #${agendamentoId} criado`);

      // Adicionar aos pendentes
      if (!this.agendamentosPendentes.has(lojista.telefone)) {
        this.agendamentosPendentes.set(lojista.telefone, []);
      }
      this.agendamentosPendentes.get(lojista.telefone).push(agendamentoId);

    } catch (error) {
      log.error('[NOTIFICACAO] Erro ao notificar lojista:', error);
      throw error;
    }
  }

  /**
   * Formata mensagem para o lojista
   */
  formatarMensagemLojista(agendamentoId, dados) {
    let msg = `🔔 *NOVO AGENDAMENTO DE VISITA* 🔔\n\n`;
    msg += `📋 *Agendamento #${agendamentoId}*\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *CLIENTE*\n`;
    msg += `Nome: ${dados.clienteNome}\n`;
    msg += `Tel: ${dados.clienteTelefone}\n\n`;

    msg += `🏠 *IMÓVEL*\n`;
    msg += `${dados.imovelEndereco}\n`;
    msg += `💰 Preço: R$ ${dados.imovelPreco?.toLocaleString('pt-BR')}\n\n`;

    msg += `📅 *AGENDAMENTO*\n`;
    msg += `Data: ${this.formatarData(dados.dataAgendamento)}\n`;
    msg += `Horário: ${dados.horaAgendamento}\n`;
    msg += `Tipo: ${this.traduzirTipoInteresse(dados.tipoInteresse)}\n\n`;

    // Financiamento
    if (dados.tipoInteresse === 'financiamento' && dados.valorEntrada) {
      msg += `💳 *FINANCIAMENTO*\n`;
      msg += `Entrada: R$ ${dados.valorEntrada?.toLocaleString('pt-BR')}\n`;
      if (dados.numeroParcelas && dados.valorParcela) {
        msg += `Parcelas: ${dados.numeroParcelas}x de R$ ${dados.valorParcela?.toLocaleString('pt-BR')}\n`;
      }
      msg += `\n`;
    }

    // Veículo de troca
    if (dados.temImovelTroca && dados.imovelTroca) {
      msg += `🔄 *IMÓVEL DE TROCA*\n`;
      msg += `${dados.imovelTroca.tipo} ${dados.imovelTroca.endereco} ${dados.imovelTroca.ano}\n`;
      if (dados.imovelTroca.valorEstimado) {
      msg += `Valor Estimado: R$ ${dados.imovelTroca.valorEstimado?.toLocaleString('pt-BR')}\n`;
      }
      msg += `\n`;
    }

    // Observações
    if (dados.observacoes) {
      msg += `📝 *OBSERVAÇÕES*\n`;
      msg += `${dados.observacoes}\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `⚡ *RESPONDA AGORA:*\n`;
    msg += `✅ Digite *APROVAR ${agendamentoId}* para confirmar\n`;
    msg += `❌ Digite *RECUSAR ${agendamentoId}* para recusar\n\n`;
    msg += `💡 Você também pode adicionar observações:\n`;
    msg += `_Exemplo: "APROVAR ${agendamentoId} - Trazer RG e CNH"_\n`;

    return msg;
  }

  /**
   * Processa resposta do lojista
   */
  async processarRespostaLojista(telefone, mensagem) {
    try {
      const msgLower = mensagem.toLowerCase().trim();

      // Detectar APROVAR
      const matchAprovar = msgLower.match(/aprovar\s+(\d+)(.*)/i);
      if (matchAprovar) {
        const agendamentoId = parseInt(matchAprovar[1]);
        const observacoes = matchAprovar[2]?.trim() || null;
        return await this.aprovarAgendamento(agendamentoId, telefone, observacoes);
      }

      // Detectar RECUSAR
      const matchRecusar = msgLower.match(/recusar\s+(\d+)(.*)/i);
      if (matchRecusar) {
        const agendamentoId = parseInt(matchRecusar[1]);
        const motivo = matchRecusar[2]?.trim() || 'Sem motivo especificado';
        return await this.recusarAgendamento(agendamentoId, telefone, motivo);
      }

      return null; // Não é uma resposta de agendamento

    } catch (error) {
      log.error('[RESPOSTA] Erro ao processar:', error);
      return null;
    }
  }

  /**
   * Aprova agendamento
   */
  async aprovarAgendamento(agendamentoId, telefone, observacoesLojista) {
    try {
      log.info(`✅ Aprovando agendamento #${agendamentoId}...`);

      // 1. Buscar dados do agendamento
      const [rows] = await this.db.execute(`
        SELECT * FROM agendamentos_visitas
        WHERE id = ? AND lojista_telefone = ? AND status = 'pendente'
      `, [agendamentoId, telefone]);

      if (rows.length === 0) {
        return {
          sucesso: false,
          mensagem: `❌ Agendamento #${agendamentoId} não encontrado ou já foi processado.`
        };
      }

      const agendamento = rows[0];

      // 2. Atualizar status no banco
      await this.db.execute(`
        UPDATE agendamentos_visitas
        SET status = 'aprovado',
            aprovado_em = NOW(),
            observacoes_lojista = ?
        WHERE id = ?
      `, [observacoesLojista, agendamentoId]);

      log.success(`✅ Agendamento #${agendamentoId} aprovado!`);

      // 3. Notificar cliente
      await this.notificarClienteAprovacao(agendamento, observacoesLojista);

      // 4. Registrar logs
      await this.registrarMensagem(agendamentoId, 'lojista', 'bot',
        `Agendamento aprovado${observacoesLojista ? ': ' + observacoesLojista : ''}`, true);

      // 5. Remover dos pendentes
      this.removerPendente(telefone, agendamentoId);

      return {
        sucesso: true,
        mensagem: `✅ *AGENDAMENTO APROVADO!*\n\nCliente notificado com sucesso!\n\n📅 ${this.formatarData(agendamento.data_agendamento)} às ${agendamento.hora_agendamento}\n👤 ${agendamento.cliente_nome}`
      };

    } catch (error) {
      log.error('[APROVAR] Erro:', error);
      return {
        sucesso: false,
        mensagem: '❌ Erro ao aprovar agendamento. Tente novamente.'
      };
    }
  }

  /**
   * Recusa agendamento
   */
  async recusarAgendamento(agendamentoId, telefone, motivoRecusa) {
    try {
      log.info(`❌ Recusando agendamento #${agendamentoId}...`);

      // 1. Buscar dados do agendamento
      const [rows] = await this.db.execute(`
        SELECT * FROM agendamentos_visitas
        WHERE id = ? AND lojista_telefone = ? AND status = 'pendente'
      `, [agendamentoId, telefone]);

      if (rows.length === 0) {
        return {
          sucesso: false,
          mensagem: `❌ Agendamento #${agendamentoId} não encontrado ou já foi processado.`
        };
      }

      const agendamento = rows[0];

      // 2. Atualizar status no banco
      await this.db.execute(`
        UPDATE agendamentos_visitas
        SET status = 'recusado',
            recusado_em = NOW(),
            motivo_recusa = ?
        WHERE id = ?
      `, [motivoRecusa, agendamentoId]);

      log.success(`❌ Agendamento #${agendamentoId} recusado!`);

      // 3. Notificar cliente
      await this.notificarClienteRecusa(agendamento, motivoRecusa);

      // 4. Registrar logs
      await this.registrarMensagem(agendamentoId, 'lojista', 'bot',
        `Agendamento recusado: ${motivoRecusa}`, true);

      // 5. Remover dos pendentes
      this.removerPendente(telefone, agendamentoId);

      return {
        sucesso: true,
        mensagem: `❌ *AGENDAMENTO RECUSADO!*\n\nCliente notificado sobre a recusa.\n\n📅 ${this.formatarData(agendamento.data_agendamento)} às ${agendamento.hora_agendamento}\n👤 ${agendamento.cliente_nome}`
      };

    } catch (error) {
      log.error('[RECUSAR] Erro:', error);
      return {
        sucesso: false,
        mensagem: '❌ Erro ao recusar agendamento. Tente novamente.'
      };
    }
  }

  /**
   * Notifica cliente sobre aprovação
   */
  async notificarClienteAprovacao(agendamento, observacoesLojista) {
    try {
      log.info(`✅ Notificando cliente ${agendamento.cliente_telefone} sobre aprovação...`);

      let mensagem = `✅ *ÓTIMA NOTÍCIA! SEU AGENDAMENTO FOI APROVADO!*\n\n`;
      mensagem += `📅 *Data:* ${this.formatarData(agendamento.data_agendamento)}\n`;
      mensagem += `⏰ *Hora:* ${agendamento.hora_agendamento}\n`;
      mensagem += `📍 *Local:* ${agendamento.imovel_endereco}\n`;
      mensagem += `👤 *Vendedor:* ${agendamento.lojista_nome}\n\n`;

      if (observacoesLojista) {
        mensagem += `📝 *Observações do Vendedor:* ${observacoesLojista}\n\n`;
      }

      mensagem += `Estamos ansiosos para te receber!`;

      await this.sock.sendMessage(agendamento.cliente_telefone, {
        text: mensagem
      });

      log.success(`✅ Cliente notificado sobre aprovação!`);
      await this.registrarMensagem(agendamento.id, 'bot', 'cliente', mensagem, true);

    } catch (error) {
      log.error('[NOTIFICACAO CLIENTE] Erro ao notificar aprovação:', error);
    }
  }

  /**
   * Notifica cliente sobre recusa
   */
  async notificarClienteRecusa(agendamento, motivoRecusa) {
    try {
      log.info(`❌ Notificando cliente ${agendamento.cliente_telefone} sobre recusa...`);

      let mensagem = `❌ *SEU AGENDAMENTO FOI RECUSADO*\n\n`;
      mensagem += `Infelizmente, seu agendamento para o dia ${this.formatarData(agendamento.data_agendamento)} às ${agendamento.hora_agendamento} foi recusado.\n\n`;
      mensagem += `Motivo: ${motivoRecusa}\n\n`;
      mensagem += `Por favor, entre em contato com a loja para reagendar ou obter mais informações.`;

      await this.sock.sendMessage(agendamento.cliente_telefone, {
        text: mensagem
      });

      log.success(`❌ Cliente notificado sobre recusa!`);
      await this.registrarMensagem(agendamento.id, 'bot', 'cliente', mensagem, true);

    } catch (error) {
      log.error('[NOTIFICACAO CLIENTE] Erro ao notificar recusa:', error);
    }
  }

  /**
   * Registra mensagens trocadas sobre agendamentos
   */
  async registrarMensagem(agendamentoId, remetente, destinatario, mensagem, enviada = false) {
    try {
      await this.db.execute(`
        INSERT INTO mensagens_agendamento (
          agendamento_id, remetente, destinatario, mensagem, enviada, criado_em
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [agendamentoId, remetente, destinatario, mensagem, enviada]);
    } catch (error) {
      log.error('[LOG MENSAGEM] Erro ao registrar mensagem:', error);
    }
  }

  /**
   * Remove agendamento da lista de pendentes do lojista
   */
  removerPendente(lojistaTelefone, agendamentoId) {
    if (this.agendamentosPendentes.has(lojistaTelefone)) {
      let pendentes = this.agendamentosPendentes.get(lojistaTelefone);
      pendentes = pendentes.filter(id => id !== agendamentoId);
      this.agendamentosPendentes.set(lojistaTelefone, pendentes);
    }
  }

  /**
   * Formata data para exibição
   */
  formatarData(data) {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  /**
   * Traduz tipo de interesse
   */
  traduzirTipoInteresse(tipo) {
    switch (tipo) {
      case 'financiamento':
        return 'Financiamento';
      case 'visita_loja':
        return 'Visita à Loja';
      case 'test_drive':
        return 'Test Drive';
      default:
        return tipo;
    }
  }
}

