import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

from backend.routes import api

print(f"API module file: {api.__file__}")
print(f"Has stats_by_empresa: {hasattr(api, 'stats_by_empresa')}")
print(f"Blueprint: {api.bp}")
