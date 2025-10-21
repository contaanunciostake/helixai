"""
VendeAI - Rotas do Robô Disparador
API para gerenciamento do sistema de disparo em massa
"""

from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
from sqlalchemy import func
import asyncio
from pathlib import Path

from backend import db_manager
from database.models import Campanha, Empresa, Usuario, TipoUsuario
from database.models_robo import (
    ConfiguracaoRoboDisparador, LeadImportacao,
    LogDisparoMassa, MetricasDisparoMassa
)
from backend.services.importador_csv import ImportadorCSV
from backend.services.disparo_massa import ServicoDisparoMassa

robo_bp = Blueprint('robo', __name__, url_prefix='/api/robo')

# Rota para renderizar o painel
from flask import render_template

@robo_bp.route('/painel', methods=['GET'])
@login_required
def painel():
    """Renderiza o painel do robô disparador"""
    return render_template('robo_disparador.html')


# ==================== CONFIGURAÇÕES ====================

@robo_bp.route('/config', methods=['GET'])
@login_required
def get_config():
    """Retorna configuração do robô disparador"""
    db = db_manager.get_session()

    try:
        config = db.query(ConfiguracaoRoboDisparador).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        if not config:
            # Criar configuração padrão
            config = ConfiguracaoRoboDisparador(empresa_id=current_user.empresa_id)
            db.add(config)
            db.commit()
            db.refresh(config)

        return jsonify({
            'sucesso': True,
            'config': {
                'id': config.id,
                'max_mensagens_por_hora': config.max_mensagens_por_hora,
                'delay_entre_mensagens_min': config.delay_entre_mensagens_min,
                'delay_entre_mensagens_max': config.delay_entre_mensagens_max,
                'horario_inicio': config.horario_inicio,
                'horario_fim': config.horario_fim,
                'habilitar_fins_semana': config.habilitar_fins_semana,
                'whatsapp_conectado': config.whatsapp_conectado,
                'modo_assistido': config.modo_assistido,
                'pausar_em_erro': config.pausar_em_erro,
                'max_tentativas_por_lead': config.max_tentativas_por_lead,
                'sempre_enviar_audio': config.sempre_enviar_audio,
                'audio_provider': config.audio_provider,
                'template_padrao': config.template_padrao,
                'ativo': config.ativo
            }
        })

    finally:
        db.close()


@robo_bp.route('/config', methods=['PUT'])
@login_required
def update_config():
    """Atualiza configuração do robô"""
    db = db_manager.get_session()

    try:
        data = request.json
        config = db.query(ConfiguracaoRoboDisparador).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        if not config:
            return jsonify({'sucesso': False, 'erro': 'Configuração não encontrada'}), 404

        # Atualizar campos
        campos_permitidos = [
            'max_mensagens_por_hora', 'delay_entre_mensagens_min',
            'delay_entre_mensagens_max', 'horario_inicio', 'horario_fim',
            'habilitar_fins_semana', 'modo_assistido', 'pausar_em_erro',
            'max_tentativas_por_lead', 'sempre_enviar_audio',
            'audio_provider', 'template_padrao', 'ativo'
        ]

        for campo in campos_permitidos:
            if campo in data:
                setattr(config, campo, data[campo])

        config.atualizado_em = datetime.utcnow()
        db.commit()

        return jsonify({
            'sucesso': True,
            'mensagem': 'Configuração atualizada com sucesso'
        })

    finally:
        db.close()


# ==================== IMPORTAÇÃO DE LEADS ====================

@robo_bp.route('/importar-csv', methods=['POST'])
@login_required
def importar_csv():
    """Importa leads de arquivo CSV"""
    db = db_manager.get_session()

    try:
        if 'arquivo' not in request.files:
            return jsonify({'sucesso': False, 'erro': 'Nenhum arquivo enviado'}), 400

        arquivo = request.files['arquivo']

        if arquivo.filename == '':
            return jsonify({'sucesso': False, 'erro': 'Nome de arquivo inválido'}), 400

        # Validar extensão
        if not arquivo.filename.lower().endswith('.csv'):
            return jsonify({'sucesso': False, 'erro': 'Apenas arquivos CSV são permitidos'}), 400

        # Salvar arquivo
        filename = secure_filename(arquivo.filename)
        upload_dir = Path('uploads')
        upload_dir.mkdir(exist_ok=True)

        filepath = upload_dir / f"{current_user.empresa_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        arquivo.save(str(filepath))

        # Importar
        importador = ImportadorCSV(db, current_user.empresa_id)
        resultado = importador.importar_arquivo(str(filepath))

        return jsonify(resultado)

    finally:
        db.close()


@robo_bp.route('/leads-importados', methods=['GET'])
@login_required
def get_leads_importados():
    """Lista leads importados"""
    db = db_manager.get_session()

    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', 'todos')  # todos, pendentes, enviados, erros

        query = db.query(LeadImportacao).filter_by(
            empresa_id=current_user.empresa_id
        )

        # Filtros
        if status == 'pendentes':
            query = query.filter_by(disparo_realizado=False, ignorar=False)
        elif status == 'enviados':
            query = query.filter_by(disparo_realizado=True, sucesso=True)
        elif status == 'erros':
            query = query.filter_by(disparo_realizado=True, sucesso=False)

        # Ordenar
        query = query.order_by(LeadImportacao.criado_em.desc())

        # Paginar
        total = query.count()
        leads = query.limit(per_page).offset((page - 1) * per_page).all()

        return jsonify({
            'sucesso': True,
            'leads': [{
                'id': lead.id,
                'nome': lead.nome,
                'whatsapp': lead.whatsapp,
                'email': lead.email,
                'empresa': lead.empresa_lead,
                'cidade': lead.cidade,
                'estado': lead.estado,
                'disparo_realizado': lead.disparo_realizado,
                'data_disparo': lead.data_disparo.isoformat() if lead.data_disparo else None,
                'sucesso': lead.sucesso,
                'respondeu': lead.respondeu,
                'tentativas': lead.tentativas,
                'erro': lead.erro_descricao
            } for lead in leads],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })

    finally:
        db.close()


@robo_bp.route('/lead/<int:lead_id>/ignorar', methods=['POST'])
@login_required
def ignorar_lead(lead_id):
    """Marca lead para ignorar (não enviar)"""
    db = db_manager.get_session()

    try:
        lead = db.query(LeadImportacao).filter_by(
            id=lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            return jsonify({'sucesso': False, 'erro': 'Lead não encontrado'}), 404

        lead.ignorar = not lead.ignorar
        db.commit()

        return jsonify({
            'sucesso': True,
            'ignorado': lead.ignorar
        })

    finally:
        db.close()


# ==================== DISPARO ====================

@robo_bp.route('/testar-disparo', methods=['POST'])
@login_required
def testar_disparo():
    """Testa disparo para um lead específico"""
    db = db_manager.get_session()

    try:
        data = request.json
        lead_id = data.get('lead_id')
        mensagem_teste = data.get('mensagem')

        if not lead_id or not mensagem_teste:
            return jsonify({'sucesso': False, 'erro': 'Dados incompletos'}), 400

        lead = db.query(LeadImportacao).filter_by(
            id=lead_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not lead:
            return jsonify({'sucesso': False, 'erro': 'Lead não encontrado'}), 404

        # Criar serviço de disparo
        servico = ServicoDisparoMassa(db, current_user.empresa_id)

        # Disparar em modo teste (modo assistido forçado)
        async def enviar():
            return await servico.disparar_para_lead(lead, mensagem_teste)

        resultado = asyncio.run(enviar())

        return jsonify({
            'sucesso': resultado.get('sucesso', False),
            'resultado': resultado
        })

    finally:
        db.close()


@robo_bp.route('/iniciar-disparo-massa', methods=['POST'])
@login_required
def iniciar_disparo_massa():
    """Inicia disparo em massa para leads pendentes"""
    db = db_manager.get_session()

    try:
        data = request.json
        campanha_id = data.get('campanha_id')
        limite = data.get('limite', 100)

        if not campanha_id:
            return jsonify({'sucesso': False, 'erro': 'Campanha não especificada'}), 400

        # Verificar permissão
        campanha = db.query(Campanha).filter_by(
            id=campanha_id,
            empresa_id=current_user.empresa_id
        ).first()

        if not campanha:
            return jsonify({'sucesso': False, 'erro': 'Campanha não encontrada'}), 404

        # Criar serviço
        servico = ServicoDisparoMassa(db, current_user.empresa_id)

        # Executar campanha em background (em produção usar Celery/RQ)
        async def executar():
            await servico.executar_campanha(campanha_id, limite)

        # Por enquanto executar síncrono (em produção usar task queue)
        asyncio.run(executar())

        return jsonify({
            'sucesso': True,
            'mensagem': 'Disparo iniciado',
            'stats': servico.stats
        })

    finally:
        db.close()


# ==================== MÉTRICAS E LOGS ====================

@robo_bp.route('/metricas', methods=['GET'])
@login_required
def get_metricas():
    """Retorna métricas de disparo"""
    db = db_manager.get_session()

    try:
        # Período
        dias = request.args.get('dias', 7, type=int)
        data_inicio = datetime.now() - timedelta(days=dias)

        # Métricas agregadas
        metricas = db.query(MetricasDisparoMassa).filter(
            MetricasDisparoMassa.empresa_id == current_user.empresa_id,
            MetricasDisparoMassa.data >= data_inicio
        ).order_by(MetricasDisparoMassa.data.desc()).all()

        # Stats gerais
        total_leads = db.query(LeadImportacao).filter_by(
            empresa_id=current_user.empresa_id
        ).count()

        leads_pendentes = db.query(LeadImportacao).filter_by(
            empresa_id=current_user.empresa_id,
            disparo_realizado=False,
            ignorar=False
        ).count()

        leads_enviados = db.query(LeadImportacao).filter_by(
            empresa_id=current_user.empresa_id,
            disparo_realizado=True
        ).count()

        leads_sucesso = db.query(LeadImportacao).filter_by(
            empresa_id=current_user.empresa_id,
            sucesso=True
        ).count()

        return jsonify({
            'sucesso': True,
            'stats_gerais': {
                'total_leads': total_leads,
                'pendentes': leads_pendentes,
                'enviados': leads_enviados,
                'sucesso': leads_sucesso,
                'taxa_sucesso': (leads_sucesso / max(leads_enviados, 1)) * 100
            },
            'metricas_diarias': [{
                'data': m.data.isoformat(),
                'total_disparos': m.total_disparos,
                'sucesso': m.total_sucesso,
                'erros': m.total_erro,
                'taxa_sucesso': m.taxa_sucesso,
                'taxa_entrega': m.taxa_entrega,
                'mensagens_por_hora': m.mensagens_por_hora
            } for m in metricas]
        })

    finally:
        db.close()


@robo_bp.route('/logs', methods=['GET'])
@login_required
def get_logs():
    """Retorna logs de disparo"""
    db = db_manager.get_session()

    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        tipo = request.args.get('tipo', 'todos')  # todos, sucesso, erro

        query = db.query(LogDisparoMassa).filter_by(
            empresa_id=current_user.empresa_id
        )

        if tipo == 'sucesso':
            query = query.filter_by(sucesso=True)
        elif tipo == 'erro':
            query = query.filter_by(sucesso=False)

        query = query.order_by(LogDisparoMassa.criado_em.desc())

        total = query.count()
        logs = query.limit(per_page).offset((page - 1) * per_page).all()

        return jsonify({
            'sucesso': True,
            'logs': [{
                'id': log.id,
                'whatsapp': log.whatsapp_destino,
                'mensagem': log.mensagem_texto[:100] + '...' if len(log.mensagem_texto) > 100 else log.mensagem_texto,
                'sucesso': log.sucesso,
                'erro': log.erro,
                'tempo_espera': log.tempo_espera_segundos,
                'rate_limit': log.rate_limit_atingido,
                'fora_horario': log.fora_horario,
                'criado_em': log.criado_em.isoformat()
            } for log in logs],
            'total': total,
            'page': page,
            'per_page': per_page
        })

    finally:
        db.close()


# ==================== STATUS ====================

@robo_bp.route('/status', methods=['GET'])
@login_required
def get_status():
    """Retorna status atual do sistema"""
    db = db_manager.get_session()

    try:
        config = db.query(ConfiguracaoRoboDisparador).filter_by(
            empresa_id=current_user.empresa_id
        ).first()

        # Criar serviço para pegar status do rate limiter
        servico = ServicoDisparoMassa(db, current_user.empresa_id)

        rate_limiter_stats = {}
        if servico.rate_limiter:
            rate_limiter_stats = servico.rate_limiter.getStats()

        return jsonify({
            'sucesso': True,
            'status': {
                'whatsapp_conectado': config.whatsapp_conectado if config else False,
                'robo_ativo': config.ativo if config else False,
                'modo_assistido': config.modo_assistido if config else True,
                'rate_limiter': rate_limiter_stats
            }
        })

    finally:
        db.close()


# ==================== DOWNLOAD CSV TEMPLATE ====================

@robo_bp.route('/template-csv', methods=['GET'])
@login_required
def download_template():
    """Download template CSV"""
    template_path = Path(__file__).parent.parent.parent / 'examples' / 'leads_teste.csv'

    if not template_path.exists():
        return jsonify({'sucesso': False, 'erro': 'Template não encontrado'}), 404

    return send_file(
        template_path,
        mimetype='text/csv',
        as_attachment=True,
        download_name='template_leads.csv'
    )
