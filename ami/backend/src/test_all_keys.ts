import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config';
import dotenv from 'dotenv';
import path from 'path';

// Force reload of .env
dotenv.config({ path: path.join(__dirname, '../.env') });

interface DiagnosticResult {
  status: 'HEALTHY' | 'LEAKED' | 'INVALID' | 'QUOTA_EXCEEDED';
  details: string;
}

async function diagnoseKey(key: string): Promise<DiagnosticResult> {
  if (!key || key.startsWith('your_')) {
    return { status: 'INVALID', details: 'Placeholder or empty key' };
  }
  
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
  let totalQuotaHits = 0;
  let lastError = '';

  for (const modelName of models) {
    try {
      const ai = new GoogleGenerativeAI(key);
      const model = ai.getGenerativeModel({ model: modelName });
      const response = await model.generateContent('Hi');
      const text = response.response.text();
      return { status: 'HEALTHY', details: `Working on ${modelName}: "${text.trim()}"` };
    } catch (err: any) {
      const errStr = String(err.message || err);
      lastError = errStr;

      const isLeaked = errStr.includes('leaked') 
        || errStr.includes('403') 
        || errStr.includes('Forbidden')
        || err?.status === 403;
        
      const isInvalid = errStr.includes('API key not valid') 
        || errStr.includes('API_KEY_INVALID') 
        || errStr.includes('400') 
        || err?.status === 400;

      if (isLeaked) {
        return { status: 'LEAKED', details: `${modelName} error: ${errStr}` };
      }
      if (isInvalid) {
        return { status: 'INVALID', details: `${modelName} error: ${errStr}` };
      }
      if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
        totalQuotaHits++;
      }
    }
  }

  if (totalQuotaHits === models.length) {
    return { status: 'QUOTA_EXCEEDED', details: 'Quota limit (429) hit on all tested models.' };
  }
  return { status: 'QUOTA_EXCEEDED', details: lastError };
}

async function run() {
  const keys = config.geminiKeys;
  console.log(`\n======================================================`);
  console.log(`🔍 RUNNING COMPREHENSIVE MULTI-MODEL KEY DIAGNOSTICS`);
  console.log(`======================================================\n`);

  const results: Array<{ index: number; name: string; key: string; status: string; details: string }> = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const keyPreview = key ? `${key.substring(0, 8)}...${key.substring(key.length - 6)}` : 'undefined';
    const label = `GEMINI_KEY_${i + 1}`;
    
    process.stdout.write(`Analyzing Key ${i + 1}/${keys.length} (${label})... `);
    const result = await diagnoseKey(key);
    console.log(`${result.status}`);
    
    results.push({
      index: i + 1,
      name: label,
      key,
      status: result.status,
      details: result.details
    });
    
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n======================================================`);
  console.log(`📊 DIAGNOSTIC RESULTS SUMMARY`);
  console.log(`======================================================`);
  
  const working = results.filter(r => r.status === 'HEALTHY');
  const rateLimited = results.filter(r => r.status === 'QUOTA_EXCEEDED');
  const leaked = results.filter(r => r.status === 'LEAKED');
  const invalid = results.filter(r => r.status === 'INVALID');

  console.log(`✅ Healthy Keys: ${working.length}`);
  console.log(`⏳ Rate Limited Keys (Valid): ${rateLimited.length}`);
  console.log(`🚫 Leaked Keys (Must replace): ${leaked.length}`);
  console.log(`❌ Invalid Keys (Must correct): ${invalid.length}`);

  if (leaked.length > 0) {
    console.log(`\n🚫 LEAKED KEYS LIST (Please replace these in your .env):`);
    leaked.forEach(r => {
      console.log(`  - [Key ${r.index}] ${r.name} = ${r.key}`);
    });
  }

  if (invalid.length > 0) {
    console.log(`\n❌ INVALID KEYS LIST (Please correct these in your .env):`);
    invalid.forEach(r => {
      console.log(`  - [Key ${r.index}] ${r.name} = ${r.key}`);
    });
  }

  console.log(`======================================================\n`);
}

run();
