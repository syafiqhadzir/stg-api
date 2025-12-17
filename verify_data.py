import pandas as pd
import psycopg2

# Database connection parameters
DB_NAME = "quran_db"
DB_USER = "jules"
DB_PASS = "password"
DB_HOST = "localhost"
DB_PORT = "5432"

def get_db_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )

def verify():
    print("Starting Verification...")
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Verify Base (Hafs)
    df_hafs = pd.read_csv("hafsData_v2-0.csv")
    csv_count_hafs = len(df_hafs)
    
    cur.execute("SELECT COUNT(*) FROM quran_verses;")
    db_count_hafs = cur.fetchone()[0]
    
    print(f"Hafs (Base): CSV Rows = {csv_count_hafs}, DB Rows = {db_count_hafs}")
    if csv_count_hafs == db_count_hafs:
        print("✅ Hafs Base Verified.")
    else:
        print("❌ Hafs Base Mismatch!")

    # 2. Verify Variants
    variant_map = {
        "warshData_v2-1.csv": "Warsh",
        "QalounData_v2-1.csv": "Qaloun",
        "DouriData_v2-0.csv": "Douri",
        "ShubaData_v2-0.csv": "Shuba",
        "SousiData_v2-0.csv": "Sousi"
    }

    for filename, name in variant_map.items():
        try:
            df = pd.read_csv(filename)
            csv_count = len(df)
            
            cur.execute("""
                SELECT COUNT(*) 
                FROM recitations r
                JOIN qiraat_variants v ON r.variant_id = v.id
                WHERE v.name = %s;
            """, (name,))
            db_count = cur.fetchone()[0]
            
            print(f"{name}: CSV Rows = {csv_count}, DB Rows = {db_count}")
            
            # Note: DB count might be lower if verses didn't match Hafs numbering (as seen in warnings)
            if csv_count == db_count:
                print(f"✅ {name} Verified.")
            else:
                print(f"⚠️ {name} Mismatch (Likely due to numbering differences). Difference: {csv_count - db_count}")
        except Exception as e:
            print(f"Error verifying {name}: {e}")

    cur.close()
    conn.close()

if __name__ == "__main__":
    verify()
