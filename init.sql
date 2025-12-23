-- Enable pg_trgm for potential linguistic search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table: quran_verses
-- Normalized dimension for canonical Quran structure
CREATE TABLE IF NOT EXISTS quran_verses (
    id SERIAL PRIMARY KEY,
    surah_number INT NOT NULL,
    ayah_number INT NOT NULL,
    juz_number INT NOT NULL,
    page_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (surah_number, ayah_number)
);

-- Table: qiraat_metadata
-- Dimension for Reciters/Qira'at
CREATE TABLE IF NOT EXISTS qiraat_metadata (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'hafs', 'warsh'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: recitation_texts
-- Fact table linking variants to verses
CREATE TABLE IF NOT EXISTS recitation_texts (
    id SERIAL PRIMARY KEY,
    verse_id INT NOT NULL REFERENCES quran_verses(id) ON DELETE CASCADE,
    qiraat_id INT NOT NULL REFERENCES qiraat_metadata(id) ON DELETE CASCADE,
    text_uthmani TEXT NOT NULL,
    text_emlaey TEXT, -- Simplified script, primarily for Hafs
    metadata JSONB DEFAULT '{}', -- Store extra CSV columns like 'line_start', 'line_end'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (verse_id, qiraat_id)
);

-- Index for text search (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_recitation_text_uthmani_gin ON recitation_texts USING GIN (text_uthmani gin_trgm_ops);

-- Materialized View: mv_comparison_matrix
-- Pivots data for fast comparison queries
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_comparison_matrix AS
SELECT
    v.surah_number,
    v.ayah_number,
    -- Aggregate JSON object of variants
    JSONB_OBJECT_AGG(
        q.slug,
        JSONB_BUILD_OBJECT(
            'text', r.text_uthmani,
            'page', v.page_number,
            'juz', v.juz_number
        )
    ) AS variants
FROM
    recitation_texts r
JOIN
    quran_verses v ON r.verse_id = v.id
JOIN
    qiraat_metadata q ON r.qiraat_id = q.id
GROUP BY
    v.surah_number,
    v.ayah_number;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_comparison_matrix_surah_ayah ON mv_comparison_matrix (surah_number, ayah_number);
