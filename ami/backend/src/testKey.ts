import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyA4VI634z3vnYfr8akP5qiLK8Z6AvHu1c4'; // Key 1 from .env
console.log('Listing models for key:', key);

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
    const data = await response.json();
    console.log('Available models:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Error Details:', err);
  }
}

run();
