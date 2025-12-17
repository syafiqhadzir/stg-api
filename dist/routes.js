"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("./db");
const node_cache_1 = __importDefault(require("node-cache"));
const router = (0, express_1.Router)();
const cache = new node_cache_1.default({ stdTTL: 3600 }); // Cache for 1 hour
const CompareRequestSchema = zod_1.z.object({
    surah: zod_1.z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0 && val <= 114, {
        message: "Invalid Surah number",
    }),
    ayah: zod_1.z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
        message: "Invalid Ayah number",
    }),
});
router.get('/qiraat/compare', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { surah, ayah } = CompareRequestSchema.parse(req.query);
        const cacheKey = `compare_${surah}_${ayah}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        // Fetch Base (Hafs)
        const baseQuery = `
      SELECT id, sura_no, aya_no, sura_name_en, sura_name_ar, text_uthmani, text_emlaey
      FROM quran_verses
      WHERE sura_no = $1 AND aya_no = $2;
    `;
        const baseRes = yield (0, db_1.query)(baseQuery, [surah, ayah]);
        if (baseRes.rows.length === 0) {
            return res.status(404).json({ error: "Verse not found" });
        }
        const baseData = baseRes.rows[0];
        // Fetch Variants
        const variantsQuery = `
      SELECT v.name, r.text
      FROM recitations r
      JOIN qiraat_variants v ON r.variant_id = v.id
      WHERE r.verse_id = $1;
    `;
        const variantsRes = yield (0, db_1.query)(variantsQuery, [baseData.id]);
        // Construct Response
        const recitations = [
            { name: "Hafs", text: baseData.text_uthmani }, // Include Hafs in list
            ...variantsRes.rows
        ];
        const responseData = {
            meta: {
                surah: baseData.sura_no,
                ayah: baseData.aya_no,
                surah_name_en: baseData.sura_name_en,
                surah_name_ar: baseData.sura_name_ar,
                base_text_emlaey: baseData.text_emlaey
            },
            recitations
        };
        cache.set(cacheKey, responseData);
        res.json(responseData);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
