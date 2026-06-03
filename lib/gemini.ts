import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

// Cliente singleton para no inicializarlo en cada petición
let genAI: GoogleGenerativeAI

export function getGeminiClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada')
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// Función para leer el prompt maestro del archivo
export function getMasterPrompt(): string {
  try {
    const promptFile = process.env.MASTER_PROMPT_FILE || 'master-prompt.txt'
    const promptPath = path.join(process.cwd(), promptFile)
    return fs.readFileSync(promptPath, 'utf8')
  } catch (error) {
    console.error('Error leyendo el prompt maestro:', error)
    return 'Eres LABORALVEN, un asistente de derecho laboral venezolano.' // Fallback
  }
}
