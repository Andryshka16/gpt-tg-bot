import dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'
import { createReadStream } from 'fs'

dotenv.config()

const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY })
const openai = new OpenAIApi(configuration)

export const transcription = async (filepath) => {
	const file = createReadStream(filepath)
	const text = await openai.createTranscription(file, 'whisper-1')
	return { role: 'user', content: text.data.text }
}

export const getResponse = async (messages) => {
	const response = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages,
	})
	const message = response.data.choices[0].message
	return message
}
