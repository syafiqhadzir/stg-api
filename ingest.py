import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import json

# Database Configuration (matches docker-compose default)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "quran_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")

CSV_DIR = "csv"

# Mapping filenames to Qira'at metadata
QIRAAT_MAP = {
    "hafsData_v2-0.csv": {"slug": "hafs", "name": "Hafs 'an 'Asim"},
    "WarshData_v2-1.csv": {"slug": "warsh", "name": "Warsh 'an Nafi'"},
    "DouriData_v2-0.csv": {"slug": "douri", "name": "Ad-Douri 'an Abi 'Amr"},
    "QalounData_v2-1.csv": {"slug": "qaloun", "name": "Qalun 'an Nafi'"},
    "ShubaData_v2-0.csv": {"slug": "shuba", "name": "Shu'bah 'an 'Asim"},
    "SousiData_v2-0.csv": {"slug": "sousi", "name": "As-Sousi 'an Abi 'Amr"},
}

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        exit(1)

def ingest_data():
    conn = get_db_connection()
    cur = conn.cursor()
    
    print("Starting ingestion process...")

    # 1. Ingest Hafs (Base Layer)
    hafs_file = "hafsData_v2-0.csv"
    hafs_path = os.path.join(CSV_DIR, hafs_file)
    
    print(f"Processing Base: {hafs_file}")
    df_hafs = pd.read_csv(hafs_path)
    
    # Ensure column names are clean
    df_hafs.columns = df_hafs.columns.str.strip()

    # Insert Qiraat Metadata (Hafs)
    q_meta = QIRAAT_MAP[hafs_file]
    cur.execute("""
        INSERT INTO qiraat_metadata (name, slug) 
        VALUES (%s, %s) 
        ON CONFLICT (slug) DO NOTHING 
        RETURNING id;
    """, (q_meta["name"], q_meta["slug"]))
    
    # Fetch Hafs ID
    cur.execute("SELECT id FROM qiraat_metadata WHERE slug = %s", (q_meta["slug"],))
    hafs_id = cur.fetchone()[0]

    # Prepare Quran Verses Data
    # Deduplicate based on Sura/Ayah to avoid specific CSV anomalies if any
    verses_data = df_hafs[['sura_no', 'aya_no', 'jozz', 'page']].drop_duplicates(subset=['sura_no', 'aya_no'])
    
    verse_values = [
        (row.sura_no, row.aya_no, row.jozz, row.page)
        for row in verses_data.itertuples(index=False)
    ]
    
    # Bulk Insert Verses (ON CONFLICT DO NOTHING to be safe)
    execute_values(cur, """
        INSERT INTO quran_verses (surah_number, ayah_number, juz_number, page_number)
        VALUES %s
        ON CONFLICT (surah_number, ayah_number) DO NOTHING
    """, verse_values)
    
    print(f"Inserted/Verified {len(verse_values)} verses structure.")

    # Prepare Hafs Texts
    # Need to get verse_ids back. 
    # Strategy: Select all verses into a dictionary {(sura, ayah): id}
    cur.execute("SELECT surah_number, ayah_number, id FROM quran_verses")
    verse_map = {(row[0], row[1]): row[2] for row in cur.fetchall()}

    text_values = []
    for row in df_hafs.itertuples(index=False):
        v_id = verse_map.get((row.sura_no, row.aya_no))
        if v_id:
            metadata = {
                "line_start": getattr(row, "line_start", None),
                "line_end": getattr(row, "line_end", None)
            }
            text_values.append((
                v_id,
                hafs_id,
                row.aya_text,
                getattr(row, "aya_text_emlaey", None),
                json.dumps(metadata)
            ))

    execute_values(cur, """
        INSERT INTO recitation_texts (verse_id, qiraat_id, text_uthmani, text_emlaey, metadata)
        VALUES %s
        ON CONFLICT (verse_id, qiraat_id) DO UPDATE 
        SET text_uthmani = EXCLUDED.text_uthmani
    """, text_values)
    
    print("Hafs texts ingested.")

    # 2. Ingest Other Variants
    for csv_file, meta in QIRAAT_MAP.items():
        if csv_file == hafs_file:
            continue
            
        print(f"Processing Variant: {csv_file}")
        path = os.path.join(CSV_DIR, csv_file)
        if not os.path.exists(path):
            print(f"Warning: File {path} not found. Skipping.")
            continue

        df = pd.read_csv(path)
        df.columns = df.columns.str.strip()

        # Insert Qiraat Metadata
        cur.execute("""
            INSERT INTO qiraat_metadata (name, slug) 
            VALUES (%s, %s) 
            ON CONFLICT (slug) DO NOTHING;
        """, (meta["name"], meta["slug"]))
        
        cur.execute("SELECT id FROM qiraat_metadata WHERE slug = %s", (meta["slug"],))
        q_id = cur.fetchone()[0]

        variant_text_values = []
        for row in df.itertuples(index=False):
            # Alignment assumption: Sura/Ayah numbering matches Hafs
            # If mismatch exists, v_id will be None and we skip (logging warning in a real system)
            v_id = verse_map.get((row.sura_no, row.aya_no))
            
            if v_id:
                metadata = {
                    "line_start": getattr(row, "line_start", None),
                    "line_end": getattr(row, "line_end", None)
                }
                variant_text_values.append((
                    v_id,
                    q_id,
                    row.aya_text,
                    None, # Others don't have emlaey in observed schema
                    json.dumps(metadata)
                ))
        
        if variant_text_values:
            execute_values(cur, """
                INSERT INTO recitation_texts (verse_id, qiraat_id, text_uthmani, text_emlaey, metadata)
                VALUES %s
                ON CONFLICT (verse_id, qiraat_id) DO UPDATE 
                SET text_uthmani = EXCLUDED.text_uthmani
            """, variant_text_values)
            print(f"Ingested {len(variant_text_values)} ayahs for {meta['slug']}.")
        else:
            print(f"No valid data found for {meta['slug']}.")

    # 3. Refresh Materialized View
    print("Refreshing Materialized View...")
    cur.execute("REFRESH MATERIALIZED VIEW mv_comparison_matrix;")
    
    conn.commit()
    cur.close()
    conn.close()
    print("Ingestion Complete.")

if __name__ == "__main__":
    ingest_data()
