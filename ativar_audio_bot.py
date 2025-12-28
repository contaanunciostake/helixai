#!/usr/bin/env python3
"""
Script para ativar udio no bot VendeAI
Atualiza a tabela configuracoes_bot no MySQL
"""

import mysql.connector
import os
from dotenv import load_dotenv

# Carregar variveis de ambiente
load_dotenv()

# Configuraes do banco de dados
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'helixai_db')
}

# Configuraes do ElevenLabs
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY', 'sk_cbf174029432ab2d87a724a3b958c5d20eb796d266477ab0')
ELEVENLABS_VOICE_ID = os.getenv('ELEVENLABS_VOICE_ID', 'r2fkFV8WAqXq2AqBpgJT')

def ativar_audio_empresa(empresa_id=1):
    """
    Ativa o udio para uma empresa especfica
    """
    try:
        # Conectar ao banco
        print(f"[1/4] Conectando ao MySQL ({DB_CONFIG['host']}/{DB_CONFIG['database']})...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print(" Conectado com sucesso!")

        # Verificar se configurao existe
        print(f"\n[2/4] Verificando configurao da empresa {empresa_id}...")
        cursor.execute(
            "SELECT id, enviar_audio, usar_elevenlabs FROM configuracoes_bot WHERE empresa_id = %s",
            (empresa_id,)
        )
        result = cursor.fetchone()

        if result:
            print(f" Configurao encontrada (ID: {result[0]})")
            print(f"   - Enviar udio atual: {result[1]}")
            print(f"   - Usar ElevenLabs atual: {result[2]}")

            # Atualizar configurao
            print(f"\n[3/4] Atualizando configurao...")
            cursor.execute("""
                UPDATE configuracoes_bot
                SET
                    enviar_audio = TRUE,
                    usar_elevenlabs = TRUE,
                    elevenlabs_api_key = %s,
                    elevenlabs_voice_id = %s
                WHERE empresa_id = %s
            """, (ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, empresa_id))

            conn.commit()
            print(" Configurao atualizada!")

        else:
            print(f" Configurao no encontrada para empresa {empresa_id}")
            print(f"\n[3/4] Criando nova configurao...")

            # Criar nova configurao
            cursor.execute("""
                INSERT INTO configuracoes_bot (
                    empresa_id,
                    enviar_audio,
                    usar_elevenlabs,
                    elevenlabs_api_key,
                    elevenlabs_voice_id,
                    auto_resposta_ativa,
                    horario_atendimento,
                    mensagem_boas_vindas
                ) VALUES (
                    %s, TRUE, TRUE, %s, %s, TRUE,
                    '{"inicio": "08:00", "fim": "18:00"}',
                    'Ol! Bem-vindo  nossa loja de veculos. Como posso ajud-lo hoje?'
                )
            """, (empresa_id, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID))

            conn.commit()
            print(" Configurao criada!")

        # Verificar resultado final
        print(f"\n[4/4] Verificando resultado final...")
        cursor.execute("""
            SELECT
                id,
                empresa_id,
                enviar_audio,
                usar_elevenlabs,
                elevenlabs_voice_id,
                auto_resposta_ativa
            FROM configuracoes_bot
            WHERE empresa_id = %s
        """, (empresa_id,))

        final = cursor.fetchone()
        if final:
            print("\n" + "="*60)
            print(" CONFIGURAO FINAL:")
            print("="*60)
            print(f"ID Config:           {final[0]}")
            print(f"Empresa ID:          {final[1]}")
            print(f"Enviar udio:        {' SIM' if final[2] else ' NO'}")
            print(f"Usar ElevenLabs:     {' SIM' if final[3] else ' NO'}")
            print(f"Voice ID:            {final[4] or 'No configurado'}")
            print(f"Auto-resposta:       {' SIM' if final[5] else ' NO'}")
            print("="*60)
            print()
            print(" udio ativado com sucesso!")
            print()
            print("PRXIMOS PASSOS:")
            print("1. Reinicie o Integrated Bot Server")
            print("2. Reconecte o WhatsApp via CRM")
            print("3. Envie uma mensagem de teste")
            print("4. O bot deve responder com TEXTO + UDIO")

        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        print(f" Erro MySQL: {err}")
        return False
    except Exception as e:
        print(f" Erro: {e}")
        return False

    return True

def listar_todas_empresas():
    """
    Lista todas as empresas e seus status de udio
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("\n" + "="*80)
        print(" TODAS AS EMPRESAS E STATUS DE UDIO")
        print("="*80)

        cursor.execute("""
            SELECT
                e.id,
                e.nome,
                e.nicho,
                COALESCE(c.enviar_audio, FALSE) as enviar_audio,
                COALESCE(c.usar_elevenlabs, FALSE) as usar_elevenlabs,
                c.elevenlabs_voice_id
            FROM empresas e
            LEFT JOIN configuracoes_bot c ON e.id = c.empresa_id
            ORDER BY e.id
        """)

        for row in cursor.fetchall():
            print(f"\n Empresa {row[0]}: {row[1]}")
            print(f"   Nicho:           {row[2]}")
            print(f"   Enviar udio:    {' SIM' if row[3] else ' NO'}")
            print(f"   ElevenLabs:      {' SIM' if row[4] else ' NO'}")
            print(f"   Voice ID:        {row[5] or 'No configurado'}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f" Erro: {e}")

if __name__ == '__main__':
    print("="*60)
    print("ATIVADOR DE AUDIO - VendeAI Bot")
    print("="*60)
    print()

    # Verificar .env
    if not os.path.exists('.env'):
        print("AVISO: Arquivo .env nao encontrado!")
        print("Usando valores padrao...")

    print(f"DB Host: {DB_CONFIG['host']}")
    print(f"DB Name: {DB_CONFIG['database']}")
    print(f"DB User: {DB_CONFIG['user']}")
    print()

    # Perguntar qual empresa
    try:
        empresa_id = input("Digite o ID da empresa (padro: 1): ").strip()
        if not empresa_id:
            empresa_id = 1
        else:
            empresa_id = int(empresa_id)
    except ValueError:
        print(" ID invlido, usando empresa 1")
        empresa_id = 1

    print()

    # Ativar udio
    if ativar_audio_empresa(empresa_id):
        print("\n" + "="*60)
        print("SUCESSO! Audio ativado.")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("FALHA ao ativar audio.")
        print("="*60)

    # Listar todas as empresas
    print("\n\nDeseja ver todas as empresas? (s/N): ", end='')
    resposta = input().strip().lower()
    if resposta == 's':
        listar_todas_empresas()
