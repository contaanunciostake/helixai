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
