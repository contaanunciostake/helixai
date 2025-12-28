"""
API de Veículos para o Bot WhatsApp
Endpoints para busca e consulta de veículos
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import Veiculo
from backend import db_manager

veiculos_bp = Blueprint('veiculos', __name__, url_prefix='/api/veiculos')


@veiculos_bp.route('/', methods=['GET'])
def listar_veiculos():
    """Lista veículos com filtros"""
    empresa_id = request.args.get('empresa_id', type=int)
    marca = request.args.get('marca')
    modelo = request.args.get('modelo')
    ano_min = request.args.get('ano_min')
    ano_max = request.args.get('ano_max')
    preco_min = request.args.get('preco_min', type=float)
    preco_max = request.args.get('preco_max', type=float)
    destaque = request.args.get('destaque', type=bool)
    disponivel = request.args.get('disponivel', default='true')
    limite = request.args.get('limite', 50, type=int)

    session = db_manager.get_session()

    try:
        query = session.query(Veiculo)

        # Filtros
        if empresa_id:
            query = query.filter_by(empresa_id=empresa_id)

        if disponivel.lower() == 'true':
            query = query.filter_by(disponivel=True)

        if marca:
            query = query.filter(Veiculo.marca.ilike(f'%{marca}%'))

        if modelo:
            query = query.filter(Veiculo.modelo.ilike(f'%{modelo}%'))

        if ano_min:
            query = query.filter(Veiculo.ano_modelo >= ano_min)

        if ano_max:
            query = query.filter(Veiculo.ano_modelo <= ano_max)

        if preco_min:
            query = query.filter(Veiculo.preco >= preco_min)

        if preco_max:
            query = query.filter(Veiculo.preco <= preco_max)

        if destaque:
            query = query.filter_by(destaque=True)

        # Ordenação
        query = query.order_by(Veiculo.criado_em.desc())

        # Limite
        veiculos = query.limit(limite).all()

        return jsonify({
            'success': True,
            'total': len(veiculos),
            'veiculos': [v.to_dict() for v in veiculos]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@veiculos_bp.route('/<int:veiculo_id>', methods=['GET'])
def buscar_veiculo(veiculo_id):
    """Busca veículo por ID"""
    session = db_manager.get_session()

    try:
        veiculo = session.query(Veiculo).get(veiculo_id)

        if not veiculo:
            return jsonify({'error': 'Veículo não encontrado'}), 404

        return jsonify({
            'success': True,
            'veiculo': veiculo.to_dict()
        })

    finally:
        session.close()


@veiculos_bp.route('/buscar', methods=['POST'])
def buscar_veiculos_inteligente():
    """Busca inteligente de veículos (para o bot)"""
    data = request.json
    empresa_id = data.get('empresa_id')
    texto_busca = data.get('texto', '')

    session = db_manager.get_session()

    try:
        query = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            disponivel=True
        )

        # Busca por marca, modelo ou descrição
        if texto_busca:
            busca = f'%{texto_busca}%'
            query = query.filter(
                (Veiculo.marca.ilike(busca)) |
                (Veiculo.modelo.ilike(busca)) |
                (Veiculo.descricao.ilike(busca))
            )

        veiculos = query.limit(10).all()

        return jsonify({
            'success': True,
            'total': len(veiculos),
            'veiculos': [v.to_dict() for v in veiculos]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@veiculos_bp.route('/destaques/<int:empresa_id>', methods=['GET'])
def buscar_destaques(empresa_id):
    """Retorna veículos em destaque"""
    limite = request.args.get('limite', 5, type=int)

    session = db_manager.get_session()

    try:
        veiculos = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            disponivel=True,
            destaque=True
        ).order_by(Veiculo.preco.asc()).limit(limite).all()

        return jsonify({
            'success': True,
            'total': len(veiculos),
            'veiculos': [v.to_dict() for v in veiculos]
        })

    finally:
        session.close()


@veiculos_bp.route('/ofertas/<int:empresa_id>', methods=['GET'])
def buscar_ofertas(empresa_id):
    """Retorna ofertas especiais"""
    limite = request.args.get('limite', 10, type=int)

    session = db_manager.get_session()

    try:
        veiculos = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            disponivel=True,
            oferta_especial=True
        ).order_by(Veiculo.preco.asc()).limit(limite).all()

        return jsonify({
            'success': True,
            'total': len(veiculos),
            'veiculos': [v.to_dict() for v in veiculos]
        })

    finally:
        session.close()


@veiculos_bp.route('/estatisticas/<int:empresa_id>', methods=['GET'])
def estatisticas(empresa_id):
    """Estatísticas de veículos"""
    session = db_manager.get_session()

    try:
        total = session.query(Veiculo).filter_by(empresa_id=empresa_id).count()
        disponiveis = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            disponivel=True
        ).count()
        vendidos = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            vendido=True
        ).count()

        # Preço médio
        from sqlalchemy import func
        preco_medio = session.query(func.avg(Veiculo.preco)).filter_by(
            empresa_id=empresa_id,
            disponivel=True
        ).scalar() or 0

        return jsonify({
            'success': True,
            'estatisticas': {
                'total': total,
                'disponiveis': disponiveis,
                'vendidos': vendidos,
                'preco_medio': round(preco_medio, 2)
            }
        })

    finally:
        session.close()


# ===================== CRUD COMPLETO =====================

@veiculos_bp.route('/criar', methods=['POST'])
def criar_veiculo():
    """Cria um novo veículo"""
    data = request.json
    empresa_id = data.get('empresa_id') or request.args.get('empresa_id')

    if not empresa_id:
        return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

    session = db_manager.get_session()

    try:
        veiculo = Veiculo(
            empresa_id=int(empresa_id),
            marca=data.get('marca', ''),
            modelo=data.get('modelo', ''),
            versao=data.get('versao', ''),
            ano_modelo=data.get('ano_modelo') or data.get('ano', ''),
            ano_fabricacao=data.get('ano_fabricacao', ''),
            preco=float(data.get('preco', 0)) if data.get('preco') else 0,
            preco_anterior=float(data.get('preco_anterior', 0)) if data.get('preco_anterior') else None,
            aceita_troca=data.get('aceita_troca', True),
            financiamento_disponivel=data.get('financiamento_disponivel', True),
            quilometragem=data.get('quilometragem', ''),
            cor=data.get('cor', ''),
            combustivel=data.get('combustivel', ''),
            cambio=data.get('cambio', ''),
            motor=data.get('motor', ''),
            portas=int(data.get('portas', 4)) if data.get('portas') else 4,
            final_placa=data.get('final_placa', ''),
            opcionais=data.get('opcionais', []),
            imagem_principal=data.get('imagem_principal') or data.get('imagem_url', ''),
            imagens_galeria=data.get('imagens_galeria', []),
            descricao=data.get('descricao', ''),
            observacoes=data.get('observacoes', ''),
            disponivel=data.get('disponivel', True),
            destaque=data.get('destaque', False),
            oferta_especial=data.get('oferta_especial', False),
            vendido=data.get('vendido', False),
            codigo_fipe=data.get('codigo_fipe', ''),
            valor_fipe=float(data.get('valor_fipe', 0)) if data.get('valor_fipe') else None,
            cidade=data.get('cidade', ''),
            estado=data.get('estado', ''),
            loja=data.get('loja', ''),
            codigo_interno=data.get('codigo_interno', ''),
            sku=data.get('sku', '')
        )

        session.add(veiculo)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Veículo criado com sucesso',
            'veiculo': veiculo.to_dict()
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@veiculos_bp.route('/atualizar/<int:veiculo_id>', methods=['PUT'])
def atualizar_veiculo(veiculo_id):
    """Atualiza um veículo existente"""
    data = request.json
    empresa_id = data.get('empresa_id') or request.args.get('empresa_id')

    session = db_manager.get_session()

    try:
        veiculo = session.query(Veiculo).filter_by(id=veiculo_id).first()

        if not veiculo:
            return jsonify({'success': False, 'error': 'Veículo não encontrado'}), 404

        # Verificar se pertence à empresa (se empresa_id fornecido)
        if empresa_id and veiculo.empresa_id != int(empresa_id):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        # Atualizar campos
        campos_atualizaveis = [
            'marca', 'modelo', 'versao', 'ano_modelo', 'ano_fabricacao',
            'preco', 'preco_anterior', 'aceita_troca', 'financiamento_disponivel',
            'quilometragem', 'cor', 'combustivel', 'cambio', 'motor', 'portas',
            'final_placa', 'opcionais', 'imagem_principal', 'imagens_galeria',
            'descricao', 'observacoes', 'disponivel', 'destaque', 'oferta_especial',
            'vendido', 'codigo_fipe', 'valor_fipe', 'cidade', 'estado', 'loja',
            'codigo_interno', 'sku'
        ]

        for campo in campos_atualizaveis:
            if campo in data:
                valor = data[campo]
                # Converter tipos específicos
                if campo in ['preco', 'preco_anterior', 'valor_fipe'] and valor:
                    valor = float(valor)
                elif campo == 'portas' and valor:
                    valor = int(valor)
                setattr(veiculo, campo, valor)

        # Atualizar também com mapeamentos alternativos
        if 'imagem_url' in data:
            veiculo.imagem_principal = data['imagem_url']
        if 'ano' in data and not data.get('ano_modelo'):
            veiculo.ano_modelo = data['ano']

        session.commit()

        return jsonify({
            'success': True,
            'message': 'Veículo atualizado com sucesso',
            'veiculo': veiculo.to_dict()
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@veiculos_bp.route('/excluir/<int:veiculo_id>', methods=['DELETE'])
def excluir_veiculo(veiculo_id):
    """Exclui um veículo"""
    empresa_id = request.args.get('empresa_id')

    session = db_manager.get_session()

    try:
        veiculo = session.query(Veiculo).filter_by(id=veiculo_id).first()

        if not veiculo:
            return jsonify({'success': False, 'error': 'Veículo não encontrado'}), 404

        # Verificar se pertence à empresa (se empresa_id fornecido)
        if empresa_id and veiculo.empresa_id != int(empresa_id):
            return jsonify({'success': False, 'error': 'Acesso negado'}), 403

        session.delete(veiculo)
        session.commit()

        return jsonify({
            'success': True,
            'message': 'Veículo excluído com sucesso'
        })

    except Exception as e:
        session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()


@veiculos_bp.route('/stats', methods=['GET'])
def stats_veiculos():
    """Estatísticas para dashboard"""
    empresa_id = request.args.get('empresa_id', type=int)

    if not empresa_id:
        return jsonify({'success': False, 'error': 'empresa_id é obrigatório'}), 400

    session = db_manager.get_session()

    try:
        from sqlalchemy import func

        total = session.query(Veiculo).filter_by(empresa_id=empresa_id).count()
        disponiveis = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            disponivel=True
        ).count()
        vendidos = session.query(Veiculo).filter_by(
            empresa_id=empresa_id,
            vendido=True
        ).count()

        # Valor total do estoque
        valor_estoque = session.query(func.sum(Veiculo.preco)).filter_by(
            empresa_id=empresa_id,
            disponivel=True
        ).scalar() or 0

        return jsonify({
            'success': True,
            'stats': {
                'total_produtos': total,
                'disponiveis': disponiveis,
                'vendidos': vendidos,
                'valor_estoque': float(valor_estoque),
                'valor_total_estoque': float(valor_estoque)
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        session.close()
