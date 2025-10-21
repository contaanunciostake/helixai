"""
VendeAI - Aplicação Principal Flask
"""

import sys
from pathlib import Path

# Adicionar pasta raiz ao path
sys.path.append(str(Path(__file__).parent.parent))

from backend import app

if __name__ == '__main__':
    print("\n" + "="*70)
    print("VENDEAI BACKEND - SERVIDOR FLASK")
    print("="*70)
    print("\nAcesse:")
    print("  Dashboard: http://localhost:5000")
    print("  Admin: http://localhost:5000/admin")
    print("  API Docs: http://localhost:5000/api/docs")
    print("\nPressione Ctrl+C para parar o servidor\n")
    print("="*70 + "\n")

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
