"""
Serviço de integração com Mercado Pago
VendeAI - Sistema de Assinaturas
"""

import mercadopago
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from database.models import DatabaseManager
from sqlalchemy import text
import json

class MercadoPagoService:
    """
    Classe para gerenciar integrações com Mercado Pago
    """

    def __init__(self):
        """Inicializa o SDK do Mercado Pago"""
        self.access_token = os.getenv('MERCADOPAGO_ACCESS_TOKEN')
        self.public_key = os.getenv('MERCADOPAGO_PUBLIC_KEY')

        if not self.access_token:
            raise ValueError("MERCADOPAGO_ACCESS_TOKEN não configurado no .env")

        # Inicializar SDK
        self.sdk = mercadopago.SDK(self.access_token)

        # Database manager
        self.db_manager = DatabaseManager('sqlite:///vendeai.db')

        print(f"[MercadoPago] SDK inicializado com sucesso")


    def criar_preferencia_pagamento(self, usuario_id: int, plano_id: int):
        """
        Cria uma preferência de pagamento no Mercado Pago

        Args:
            usuario_id: ID do usuário
            plano_id: ID do plano escolhido

        Returns:
            dict com init_point e preference_id
        """
        session = self.db_manager.get_session()

        try:
            # Buscar usuário
            usuario_query = text("SELECT id, nome, email FROM usuarios WHERE id = :id")
            usuario = session.execute(usuario_query, {'id': usuario_id}).fetchone()

            if not usuario:
                raise ValueError("Usuário não encontrado")

            # Buscar plano
            plano_query = text("SELECT * FROM planos WHERE id = :id AND ativo = 1")
            plano = session.execute(plano_query, {'id': plano_id}).fetchone()

            if not plano:
                raise ValueError("Plano não encontrado")

            # URLs de retorno
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5174')

            # Criar item do pagamento
            preference_data = {
                "items": [
                    {
                        "title": f"VendeAI - Plano {plano.nome}",
                        "description": plano.descricao or f"Assinatura mensal do plano {plano.nome}",
                        "quantity": 1,
                        "currency_id": "BRL",
                        "unit_price": float(plano.preco)
                    }
                ],
                "payer": {
                    "name": usuario.nome,
                    "email": usuario.email
                },
                "back_urls": {
                    "success": f"{frontend_url}/pagamento/sucesso",
                    "failure": f"{frontend_url}/pagamento/falha",
                    "pending": f"{frontend_url}/pagamento/pendente"
                },
                "auto_return": "approved",
                "external_reference": f"usuario_{usuario_id}_plano_{plano_id}",
                "notification_url": f"{os.getenv('BACKEND_URL')}/api/webhook/mercadopago",
                "metadata": {
                    "usuario_id": usuario_id,
                    "plano_id": plano_id,
                    "tipo": "assinatura"
                }
            }

            # Criar preferência
            preference_response = self.sdk.preference().create(preference_data)
            preference = preference_response["response"]

            print(f"[MercadoPago] Preferência criada: {preference['id']}")

            # Salvar assinatura pendente no banco
            insert_assinatura = text("""
                INSERT INTO assinaturas
                (usuario_id, plano_id, mercadopago_preference_id, status, valor_pago, criado_em)
                VALUES (:usuario_id, :plano_id, :preference_id, 'pending', :valor, :criado_em)
            """)

            session.execute(insert_assinatura, {
                'usuario_id': usuario_id,
                'plano_id': plano_id,
                'preference_id': preference['id'],
                'valor': plano.preco,
                'criado_em': datetime.now()
            })
            session.commit()

            return {
                'success': True,
                'init_point': preference['init_point'],
                'sandbox_init_point': preference.get('sandbox_init_point'),
                'preference_id': preference['id'],
                'public_key': self.public_key
            }

        except Exception as e:
            session.rollback()
            print(f"[MercadoPago] Erro ao criar preferência: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()


    def verificar_limites_usuario(self, usuario_id: int):
        """
        Verifica limites de uso do usuário no mês atual

        Returns:
            dict com informações de uso e limites
        """
        session = self.db_manager.get_session()

        try:
            # Buscar assinatura ativa
            assinatura_query = text("""
                SELECT a.*, p.nome as plano_nome, p.limite_mensagens, p.limite_tokens
                FROM assinaturas a
                JOIN planos p ON a.plano_id = p.id
                WHERE a.usuario_id = :usuario_id AND a.status = 'active'
                ORDER BY a.criado_em DESC
                LIMIT 1
            """)

            assinatura = session.execute(assinatura_query, {'usuario_id': usuario_id}).fetchone()

            if not assinatura:
                return {
                    'tem_assinatura': False,
                    'status': 'sem_assinatura',
                    'mensagem': 'Você precisa assinar um plano para usar o sistema'
                }

            # Buscar uso do mês atual
            mes_referencia = datetime.now().replace(day=1).strftime('%Y-%m-%d')

            uso_query = text("""
                SELECT * FROM uso_mensal
                WHERE usuario_id = :usuario_id AND mes_referencia = :mes
            """)

            uso = session.execute(uso_query, {
                'usuario_id': usuario_id,
                'mes': mes_referencia
            }).fetchone()

            mensagens_usadas = uso.mensagens_usadas if uso else 0
            tokens_usados = uso.tokens_usados if uso else 0

            # Verificar se excedeu limites
            mensagens_excedidas = mensagens_usadas >= assinatura.limite_mensagens
            tokens_excedidos = tokens_usados >= assinatura.limite_tokens

            return {
                'tem_assinatura': True,
                'status': 'active',
                'plano': assinatura.plano_nome,
                'limites': {
                    'mensagens': assinatura.limite_mensagens,
                    'tokens': assinatura.limite_tokens
                },
                'uso': {
                    'mensagens': mensagens_usadas,
                    'tokens': tokens_usados
                },
                'percentual_uso': {
                    'mensagens': (mensagens_usadas / assinatura.limite_mensagens * 100) if assinatura.limite_mensagens > 0 else 0,
                    'tokens': (tokens_usados / assinatura.limite_tokens * 100) if assinatura.limite_tokens > 0 else 0
                },
                'excedeu_limites': mensagens_excedidas or tokens_excedidos,
                'mensagens_excedidas': mensagens_excedidas,
                'tokens_excedidos': tokens_excedidos
            }

        except Exception as e:
            print(f"[MercadoPago] Erro ao verificar limites: {str(e)}")
            return {
                'tem_assinatura': False,
                'error': str(e)
            }
        finally:
            session.close()


    def registrar_uso(self, usuario_id: int, mensagens: int = 1, tokens: int = 0):
        """
        Registra uso de mensagens e tokens do usuário

        Args:
            usuario_id: ID do usuário
            mensagens: Número de mensagens (default: 1)
            tokens: Número de tokens consumidos (default: 0)
        """
        session = self.db_manager.get_session()

        try:
            mes_referencia = datetime.now().replace(day=1).strftime('%Y-%m-%d')

            # Verificar se já existe registro para este mês
            uso_query = text("""
                SELECT id FROM uso_mensal
                WHERE usuario_id = :usuario_id AND mes_referencia = :mes
            """)

            uso_existente = session.execute(uso_query, {
                'usuario_id': usuario_id,
                'mes': mes_referencia
            }).fetchone()

            if uso_existente:
                # Atualizar registro existente
                update_query = text("""
                    UPDATE uso_mensal
                    SET mensagens_usadas = mensagens_usadas + :mensagens,
                        tokens_usados = tokens_usados + :tokens,
                        ultima_atualizacao = :agora
                    WHERE id = :id
                """)

                session.execute(update_query, {
                    'mensagens': mensagens,
                    'tokens': tokens,
                    'agora': datetime.now(),
                    'id': uso_existente.id
                })
            else:
                # Criar novo registro
                insert_query = text("""
                    INSERT INTO uso_mensal
                    (usuario_id, mes_referencia, mensagens_usadas, tokens_usados, ultima_atualizacao)
                    VALUES (:usuario_id, :mes, :mensagens, :tokens, :agora)
                """)

                session.execute(insert_query, {
                    'usuario_id': usuario_id,
                    'mes': mes_referencia,
                    'mensagens': mensagens,
                    'tokens': tokens,
                    'agora': datetime.now()
                })

            session.commit()
            print(f"[MercadoPago] Uso registrado - Usuário {usuario_id}: +{mensagens} mensagens, +{tokens} tokens")

        except Exception as e:
            session.rollback()
            print(f"[MercadoPago] Erro ao registrar uso: {str(e)}")
        finally:
            session.close()


    def cancelar_assinatura(self, usuario_id: int):
        """
        Cancela assinatura ativa do usuário

        Args:
            usuario_id: ID do usuário

        Returns:
            dict com resultado da operação
        """
        session = self.db_manager.get_session()

        try:
            # Buscar assinatura ativa
            assinatura_query = text("""
                SELECT * FROM assinaturas
                WHERE usuario_id = :usuario_id AND status = 'active'
                ORDER BY criado_em DESC
                LIMIT 1
            """)

            assinatura = session.execute(assinatura_query, {'usuario_id': usuario_id}).fetchone()

            if not assinatura:
                return {
                    'success': False,
                    'error': 'Nenhuma assinatura ativa encontrada'
                }

            # Atualizar status no banco
            update_query = text("""
                UPDATE assinaturas
                SET status = 'cancelled',
                    atualizado_em = :agora
                WHERE id = :id
            """)

            session.execute(update_query, {
                'agora': datetime.now(),
                'id': assinatura.id
            })

            session.commit()

            print(f"[MercadoPago] Assinatura cancelada - Usuário {usuario_id}")

            return {
                'success': True,
                'message': 'Assinatura cancelada com sucesso'
            }

        except Exception as e:
            session.rollback()
            print(f"[MercadoPago] Erro ao cancelar assinatura: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()


    def processar_webhook_pagamento(self, payment_data: dict):
        """
        Processa webhook de pagamento do Mercado Pago

        Args:
            payment_data: Dados do pagamento recebidos no webhook
        """
        session = self.db_manager.get_session()

        try:
            payment_id = payment_data.get('id')
            if not payment_id:
                print("[MercadoPago Webhook] payment_id não encontrado")
                return

            # Buscar detalhes do pagamento na API do Mercado Pago
            payment_info = self.sdk.payment().get(payment_id)
            payment = payment_info.get('response', {})

            if not payment:
                print(f"[MercadoPago Webhook] Pagamento {payment_id} não encontrado na API")
                return

            # Extrair informações
            status = payment.get('status')
            external_reference = payment.get('external_reference', '')
            metadata = payment.get('metadata', {})

            usuario_id = metadata.get('usuario_id')
            plano_id = metadata.get('plano_id')

            if not usuario_id or not plano_id:
                print(f"[MercadoPago Webhook] Metadados incompletos no pagamento {payment_id}")
                return

            print(f"[MercadoPago Webhook] Processando pagamento {payment_id} - Status: {status}")

            # Registrar pagamento no banco
            insert_pagamento = text("""
                INSERT OR REPLACE INTO pagamentos
                (usuario_id, mercadopago_payment_id, tipo, status, valor, metodo_pagamento,
                 descricao, data_pagamento, webhook_data, criado_em)
                VALUES (:usuario_id, :payment_id, 'subscription', :status, :valor, :metodo,
                        :descricao, :data_pagamento, :webhook_data, :criado_em)
            """)

            session.execute(insert_pagamento, {
                'usuario_id': usuario_id,
                'payment_id': payment_id,
                'status': status,
                'valor': payment.get('transaction_amount', 0),
                'metodo': payment.get('payment_method_id'),
                'descricao': payment.get('description'),
                'data_pagamento': payment.get('date_approved'),
                'webhook_data': json.dumps(payment),
                'criado_em': datetime.now()
            })

            # Se pagamento aprovado, ativar assinatura
            if status == 'approved':
                # Calcular datas
                data_inicio = datetime.now()
                data_fim = data_inicio + relativedelta(months=1)
                proximo_pagamento = data_fim

                # Atualizar assinatura
                update_assinatura = text("""
                    UPDATE assinaturas
                    SET status = 'active',
                        data_inicio = :data_inicio,
                        data_fim = :data_fim,
                        proximo_pagamento = :proximo_pagamento,
                        mercadopago_subscription_id = :payment_id,
                        metodo_pagamento = :metodo,
                        atualizado_em = :agora
                    WHERE usuario_id = :usuario_id AND plano_id = :plano_id AND status = 'pending'
                """)

                session.execute(update_assinatura, {
                    'data_inicio': data_inicio,
                    'data_fim': data_fim,
                    'proximo_pagamento': proximo_pagamento,
                    'payment_id': payment_id,
                    'metodo': payment.get('payment_method_id'),
                    'agora': datetime.now(),
                    'usuario_id': usuario_id,
                    'plano_id': plano_id
                })

                print(f"[MercadoPago Webhook] Assinatura ativada para usuário {usuario_id}")

            session.commit()

        except Exception as e:
            session.rollback()
            print(f"[MercadoPago Webhook] Erro ao processar pagamento: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            session.close()


# Instância global do serviço
mp_service = MercadoPagoService()
