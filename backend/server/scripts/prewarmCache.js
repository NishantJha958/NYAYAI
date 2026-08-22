import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import cache from '../utils/cache.js';
import { getCacheKey } from '../utils/cacheUtils.js';
import { sendChatMessage, searchLegalDB } from '../services/aiBridge.js';
import logger from '../utils/logger.js';

const CHAT_QUERIES = [
  "What are my tenant rights if landlord keeps security deposit?",
  "How to file RTI application online?",
  "What to do if shopkeeper sells defective product?",
  "How to register a police complaint online?",
  "What is the legal age for marriage in India?",
  "Can an employer fire me without notice?",
  "How to get a birth certificate corrected?",
  "What are the grounds for divorce in Hindu Law?",
  "How to file consumer court case?",
  "Rights of a woman during arrest?"
];

const SEARCH_QUERIES = [
  "tenant rights security deposit UP rent control",
  "RTI section 7 time limit",
  "defective goods consumer protection act",
  "cheating IPC section 420 or BNS",
  "child marriage act punishment",
  "maternity benefit act leave duration",
  "dowry harassment 498A",
  "motor vehicle act fine for driving without license",
  "cyber crime complaint procedure IT Act",
  "domestic violence act protection officer"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function prewarmChat() {
  logger.info('--- Starting Chat Pre-warming ---');
  for (const query of CHAT_QUERIES) {
    const lang = 'en';
    const cacheKey = getCacheKey('chat', lang, query);
    
    try {
      const existing = await cache.get(cacheKey);
      if (existing) {
        logger.info(`[CHAT] HIT - "${query.substring(0, 30)}..."`);
        continue;
      }

      logger.info(`[CHAT] MISS - Fetching "${query.substring(0, 30)}..."`);
      const aiResult = await sendChatMessage({
        message: query,
        history: [],
        language: lang
      });
      
      const assistantContent = aiResult.answer || 'I am sorry, I could not generate a response.';
      await cache.setex(cacheKey, 7 * 24 * 3600, assistantContent);
      logger.info(`[CHAT] SAVED - "${query.substring(0, 30)}..."`);
      
      await sleep(2000); // 2 second delay to avoid rate limits
    } catch (err) {
      logger.error(`[CHAT] ERROR for "${query.substring(0, 30)}...": ${err.message}`);
    }
  }
}

async function prewarmSearch() {
  logger.info('--- Starting Search Pre-warming ---');
  for (const query of SEARCH_QUERIES) {
    const lang = 'en';
    const filters = {};
    const cacheKey = getCacheKey('search', lang, query, filters);
    
    try {
      const existing = await cache.get(cacheKey);
      if (existing) {
        logger.info(`[SEARCH] HIT - "${query.substring(0, 30)}..."`);
        continue;
      }

      logger.info(`[SEARCH] MISS - Fetching "${query.substring(0, 30)}..."`);
      const results = await searchLegalDB({
        query: query,
        language: lang,
        filters: filters
      });
      
      await cache.setex(cacheKey, 7 * 24 * 3600, JSON.stringify(results));
      logger.info(`[SEARCH] SAVED - "${query.substring(0, 30)}..."`);
      
      await sleep(2000);
    } catch (err) {
      logger.error(`[SEARCH] ERROR for "${query.substring(0, 30)}...": ${err.message}`);
    }
  }
}

async function main() {
  logger.info('Starting Redis Cache Pre-warming Script...');
  await prewarmChat();
  await prewarmSearch();
  logger.info('Pre-warming Complete!');
  process.exit(0);
}

main();
