"""
Rotas de Gestão de Conexões WhatsApp - VendeAI
Permite conectar múltiplas instâncias de WhatsApp via QR Code
"""

from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from sqlalchemy import desc
from datetime import datetime
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from database.models import Empresa
from backend import db_manager
import json

whatsapp_bp = Blueprint('whatsapp', __name__, url_prefix='/whatsapp')


@whatsapp_bp.route('/')
@login_required
def index():
    """Página principal de gestão de WhatsApp"""
    session = db_manager.get_session()

    try:
        # Buscar empresa do usuário
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            flash('Empresa não encontrada.', 'danger')
            return redirect(url_for('dashboard.index'))

        # Estatísticas de conexões (exemplo)
        total_conexoes = 1  # Por enquanto suportando 1 conexão
        conexoes_ativas = 1 if empresa.whatsapp_conectado else 0
        mensagens_hoje = 0  # TODO: buscar do banco

        return render_template('whatsapp/index.html',
                             empresa=empresa,
                             total_conexoes=total_conexoes,
                             conexoes_ativas=conexoes_ativas,
                             mensagens_hoje=mensagens_hoje)

    except Exception as e:
        flash(f'Erro ao carregar página WhatsApp: {str(e)}', 'danger')
        return redirect(url_for('dashboard.index'))
    finally:
        session.close()


@whatsapp_bp.route('/api/gerar-qr', methods=['POST'])
@login_required
def api_gerar_qr():
    """API para gerar novo QR Code de conexão"""
    import requests
    import qrcode
    import io
    import base64

    session = db_manager.get_session()
    WHATSAPP_SERVICE_URL = 'http://localhost:3001'

    try:
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        try:
            # Tentar conectar ao serviço WhatsApp (Baileys)
            response = requests.post(
                f'{WHATSAPP_SERVICE_URL}/api/session/start',
                json={'empresaId': empresa.id},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()

                if data.get('qr'):
                    # Gerar imagem do QR Code a partir da string
                    qr_text = data['qr']
                    qr = qrcode.QRCode(
                        version=1,
                        error_correction=qrcode.constants.ERROR_CORRECT_L,
                        box_size=10,
                        border=4,
                    )
                    qr.add_data(qr_text)
                    qr.make(fit=True)

                    img = qr.make_image(fill_color="black", back_color="white")

                    # Converter para base64
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)
                    qr_code_base64 = f"data:image/png;base64,{base64.b64encode(buffer.read()).decode()}"

                    # Atualizar QR code na empresa
                    empresa.whatsapp_qr_code = qr_code_base64
                    session.commit()

                    return jsonify({
                        'success': True,
                        'qr_code': qr_code_base64,
                        'message': 'QR Code gerado com sucesso! Escaneie com seu WhatsApp.',
                        'using_baileys': True
                    })

                elif data.get('connected'):
                    # Já está conectado
                    empresa.whatsapp_conectado = True
                    empresa.whatsapp_numero = data.get('numero')
                    empresa.whatsapp_qr_code = None
                    session.commit()

                    return jsonify({
                        'success': True,
                        'message': 'WhatsApp já está conectado!',
                        'connected': True,
                        'numero': data.get('numero')
                    })

                else:
                    return jsonify({
                        'success': True,
                        'message': 'Aguardando QR Code do serviço WhatsApp...',
                        'using_baileys': True
                    })

        except requests.exceptions.ConnectionError:
            # Serviço WhatsApp não está rodando, usar fallback
            print('[WhatsApp] Serviço Node.js não disponível, usando modo simulação')

            # Gerar QR code de simulação
            from datetime import datetime
            import secrets
            token = secrets.token_urlsafe(32)
            timestamp = int(datetime.utcnow().timestamp())
            connection_code = f"vendeai://demo:{empresa.id}:{timestamp}:{token}"

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(connection_code)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)
            qr_code_base64 = f"data:image/png;base64,{base64.b64encode(buffer.read()).decode()}"

            empresa.whatsapp_qr_code = qr_code_base64
            session.commit()

            return jsonify({
                'success': True,
                'qr_code': qr_code_base64,
                'message': 'QR Code gerado (modo simulação). Para conexão real, inicie o serviço WhatsApp.',
                'using_baileys': False,
                'warning': 'Serviço WhatsApp não está rodando. Use "Simular Conexão" para testar.'
            })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@whatsapp_bp.route('/api/status', methods=['GET'])
@login_required
def api_status():
    """API para verificar status da conexão WhatsApp"""
    session = db_manager.get_session()

    try:
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # TODO: Verificar status real da conexão com WhatsApp
        status = {
            'conectado': empresa.whatsapp_conectado,
            'numero': empresa.whatsapp_numero,
            'qr_code': empresa.whatsapp_qr_code,
            'bot_ativo': empresa.bot_ativo
        }

        return jsonify({
            'success': True,
            'status': status
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@whatsapp_bp.route('/api/desconectar', methods=['POST'])
@login_required
def api_desconectar():
    """API para desconectar WhatsApp"""
    session = db_manager.get_session()

    try:
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # TODO: Desconectar WhatsApp Web API
        empresa.whatsapp_conectado = False
        empresa.whatsapp_qr_code = None
        empresa.bot_ativo = False
        session.commit()

        return jsonify({
            'success': True,
            'message': 'WhatsApp desconectado com sucesso!'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@whatsapp_bp.route('/api/ativar-bot', methods=['POST'])
@login_required
def api_ativar_bot():
    """API para ativar/desativar bot"""
    session = db_manager.get_session()

    try:
        data = request.get_json()
        ativar = data.get('ativar', True)

        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        if not empresa.whatsapp_conectado:
            return jsonify({
                'success': False,
                'error': 'WhatsApp não está conectado. Conecte primeiro para ativar o bot.'
            }), 400

        empresa.bot_ativo = ativar
        session.commit()

        return jsonify({
            'success': True,
            'message': f'Bot {"ativado" if ativar else "desativado"} com sucesso!',
            'bot_ativo': ativar
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@whatsapp_bp.route('/api/simular-conexao', methods=['POST'])
@login_required
def api_simular_conexao():
    """API temporária para simular conexão bem-sucedida (desenvolvimento)"""
    session = db_manager.get_session()

    try:
        empresa = session.query(Empresa).filter_by(
            id=current_user.empresa_id
        ).first()

        if not empresa:
            return jsonify({'success': False, 'error': 'Empresa não encontrada'}), 404

        # Simular conexão bem-sucedida
        empresa.whatsapp_conectado = True
        empresa.whatsapp_numero = '+55 11 99999-9999'  # Número fictício
        empresa.whatsapp_qr_code = None  # Limpar QR code após conexão
        session.commit()

        return jsonify({
            'success': True,
            'message': 'WhatsApp conectado com sucesso! (simulação)',
            'numero': empresa.whatsapp_numero
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
