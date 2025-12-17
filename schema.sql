
-- quran_verses table
CREATE TABLE IF NOT EXISTS quran_verses (
    id SERIAL PRIMARY KEY,
    sura_no INTEGER NOT NULL,
    aya_no INTEGER NOT NULL,
    sura_name_en VARCHAR(255),
    sura_name_ar VARCHAR(255),
    text_uthmani TEXT, -- Hafs Uthmani
    text_emlaey TEXT, -- Hafs Simple (searchable)
    jozz INTEGER,
    page INTEGER,
    UNIQUE(sura_no, aya_no)
);

-- qiraat_variants table
CREATE TABLE IF NOT EXISTS qiraat_variants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- recitations table
CREATE TABLE IF NOT EXISTS recitations (
    id SERIAL PRIMARY KEY,
    verse_id INTEGER NOT NULL REFERENCES quran_verses(id) ON DELETE CASCADE,
    variant_id INTEGER NOT NULL REFERENCES qiraat_variants(id) ON DELETE CASCADE,
    text TEXT NOT NULL, -- Uthmani script of the variant
    UNIQUE(verse_id, variant_id)
);

-- Indexing for search
CREATE INDEX idx_quran_verses_text_emlaey ON quran_verses USING GIN(to_tsvector('simple', text_emlaey));
CREATE INDEX idx_quran_verses_sura_aya ON quran_verses(sura_no, aya_no);
