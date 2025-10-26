"""
WSGI Entry Point para Render.com
"""
import sys
from pathlib import Path

# Adicionar diretório pai ao path para importar 'backend'
sys.path.insert(0, str(Path(__file__).parent.parent))

# Importar app do módulo backend
from backend import app

if __name__ == '__main__':
    app.run()
