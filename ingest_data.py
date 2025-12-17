import pandas as pd
import psycopg2
import os

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

def ingest_hafs_base(csv_path):
    print(f"Ingesting Base (Hafs) from {csv_path}...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Read CSV with explicit encoding if needed, though utf-8 is standard
        # The provided files might have specific encoding, let's assume utf-8 for now based on read_file output
        df = pd.read_csv(csv_path)
        
        # Helper to handle potential BOM or weird column names if any
        # Based on previous `read_file`, cols are: 
        # id,jozz,page,sura_no,sura_name_en,sura_name_ar,line_start,line_end,aya_no,aya_text,aya_text_emlaey
        
        for index, row in df.iterrows():
            cur.execute("""
                INSERT INTO quran_verses (sura_no, aya_no, sura_name_en, sura_name_ar, text_uthmani, text_emlaey, jozz, page)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (sura_no, aya_no) DO NOTHING;
            """, (
                row['sura_no'],
                row['aya_no'],
                row['sura_name_en'],
                row['sura_name_ar'],
                row['aya_text'],
                row['aya_text_emlaey'],
                row['jozz'],
                row['page']
            ))
        
        conn.commit()
        print("Hafs (Base) ingestion complete.")
    except Exception as e:
        print(f"Error ingesting Hafs: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def setup_variants():
    print("Setting up Qiraat variants...")
    variants = ['Warsh', 'Qaloun', 'Douri', 'Shuba', 'Sousi']
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        for v in variants:
            cur.execute("INSERT INTO qiraat_variants (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", (v,))
        conn.commit()
        print("Variants setup complete.")
    except Exception as e:
        print(f"Error setting up variants: {e}")
    finally:
        cur.close()
        conn.close()

def ingest_variant(csv_path, variant_name):
    print(f"Ingesting {variant_name} from {csv_path}...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Get variant ID
        cur.execute("SELECT id FROM qiraat_variants WHERE name = %s;", (variant_name,))
        res = cur.fetchone()
        if not res:
            print(f"Variant {variant_name} not found in DB.")
            return
        variant_id = res[0]
        
        df = pd.read_csv(csv_path)
        
        # Columns: id,jozz,page,sura_no,sura_name_en,sura_name_ar,line_start,line_end,aya_no,aya_text
        # Note: Some CSVs might not have text_emlaey
        
        count = 0
        for index, row in df.iterrows():
            # Find the verse_id from quran_verses
            cur.execute("SELECT id FROM quran_verses WHERE sura_no = %s AND aya_no = %s;", (row['sura_no'], row['aya_no']))
            v_res = cur.fetchone()
            
            if v_res:
                verse_id = v_res[0]
                cur.execute("""
                    INSERT INTO recitations (verse_id, variant_id, text)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (verse_id, variant_id) DO NOTHING;
                """, (verse_id, variant_id, row['aya_text']))
                count += 1
            else:
                print(f"Warning: Verse not found for {variant_name} - Surah {row['sura_no']}, Ayah {row['aya_no']}")
        
        conn.commit()
        print(f"{variant_name} ingestion complete. Inserted/Checked {count} records.")
    except Exception as e:
        print(f"Error ingesting {variant_name}: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # 1. Ingest Base (Hafs)
    ingest_hafs_base("hafsData_v2-0.csv")
    
    # 2. Setup Variants
    setup_variants()
    
    # 3. Ingest Variants
    # Map of filename -> variant name
    variant_map = {
        "warshData_v2-1.csv": "Warsh",
        "QalounData_v2-1.csv": "Qaloun",
        "DouriData_v2-0.csv": "Douri",
        "ShubaData_v2-0.csv": "Shuba",
        "SousiData_v2-0.csv": "Sousi"
    }
    
    for filename, name in variant_map.items():
        if os.path.exists(filename):
            ingest_variant(filename, name)
        else:
            print(f"File {filename} not found.")
