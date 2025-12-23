exports.shorthands = undefined;

exports.up = (pgm) => {
    // Enable extensions
    pgm.createExtension('pg_trgm', { ifNotExists: true });

    // 1. Quran Verses
    pgm.createTable('quran_verses', {
        id: { type: 'serial', primaryKey: true },
        surah_number: { type: 'integer', notNull: true },
        ayah_number: { type: 'integer', notNull: true },
        juz_number: { type: 'integer', notNull: true },
        page_number: { type: 'integer', notNull: true },
        created_at: {
            type: 'timestamp with time zone',
            default: pgm.func('now()'),
        },
    }, {
        constraints: {
            unique: ['surah_number', 'ayah_number'],
        },
    });

    // 2. Qiraat Metadata
    pgm.createTable('qiraat_metadata', {
        id: { type: 'serial', primaryKey: true },
        name: { type: 'varchar(255)', notNull: true, unique: true },
        slug: { type: 'varchar(50)', notNull: true, unique: true },
        description: { type: 'text' },
        created_at: {
            type: 'timestamp with time zone',
            default: pgm.func('now()'),
        },
    });

    // 3. Recitation Texts
    pgm.createTable('recitation_texts', {
        id: { type: 'serial', primaryKey: true },
        verse_id: {
            type: 'integer',
            notNull: true,
            references: '"quran_verses"',
            onDelete: 'CASCADE',
        },
        qiraat_id: {
            type: 'integer',
            notNull: true,
            references: '"qiraat_metadata"',
            onDelete: 'CASCADE',
        },
        text_uthmani: { type: 'text', notNull: true },
        text_emlaey: { type: 'text' },
        metadata: { type: 'jsonb', default: '{}' },
        created_at: {
            type: 'timestamp with time zone',
            default: pgm.func('now()'),
        },
    }, {
        constraints: {
            unique: ['verse_id', 'qiraat_id'],
        },
    });

    // Indexes
    pgm.createIndex('recitation_texts', 'text_uthmani', { method: 'gin', opclass: 'gin_trgm_ops' });

    // 4. Materialized View
    pgm.sql(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_comparison_matrix AS
    SELECT
        v.surah_number,
        v.ayah_number,
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
  `);

    pgm.createIndex('mv_comparison_matrix', ['surah_number', 'ayah_number'], { unique: true });
};

exports.down = (pgm) => {
    pgm.dropMaterializedView('mv_comparison_matrix');
    pgm.dropTable('recitation_texts');
    pgm.dropTable('qiraat_metadata');
    pgm.dropTable('quran_verses');
    pgm.dropExtension('pg_trgm');
};
