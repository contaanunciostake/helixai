import sqlite3

# Check both databases
for db_path in [r'D:\Helix\HelixAI\vendeai.db', r'D:\Helix\HelixAI\Databases\vendeai.db']:
    print(f"\n=== Checking: {db_path} ===")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if empresas table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='empresas';")
        table_exists = cursor.fetchone()
        print(f"empresas table exists: {bool(table_exists)}")

        if table_exists:
            # Count total empresas
            cursor.execute("SELECT COUNT(*) FROM empresas;")
            total = cursor.fetchone()[0]
            print(f"Total empresas: {total}")

            # Check for empresa 22
            cursor.execute("SELECT id, nome FROM empresas WHERE id=22;")
            empresa_22 = cursor.fetchone()
            if empresa_22:
                print(f"Empresa 22: ID={empresa_22[0]}, Nome={empresa_22[1]}")
            else:
                print("Empresa 22: NOT FOUND")

                # Show all empresas IDs
                cursor.execute("SELECT id, nome FROM empresas LIMIT 10;")
                all_empresas = cursor.fetchall()
                print(f"Available empresas (first 10):")
                for emp in all_empresas:
                    print(f"  ID={emp[0]}, Nome={emp[1]}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")
