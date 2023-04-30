import dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import { code } from 'telegraf/format'
import { message } from 'telegraf/filters'
import { getResponse, transcription } from '../utils/openai.js'
import { unlink } from 'fs/promises'
import downloadFile from '../utils/downloadFile.js'
import convertOggToMp3 from '../utils/convertToMp3.js'

dotenv.config()

const initialSession = {
	messages: [],
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.use(session())

bot.command('start', async (ctx) => {
	ctx.session = initialSession
	await ctx.reply('Welcome!')
})
bot.command('new', async (ctx) => {
	ctx.session = initialSession
	await ctx.reply('Cleared conversation.')
})

bot.on(message('voice'), async (ctx) => {
	ctx.session ??= initialSession

	const link = (await ctx.telegram.getFileLink(ctx.message.voice.file_id)).href
	const userId = await ctx.message.from.id

	const oggPath = await downloadFile(link, `${userId}.ogg`)
	const mp3Path = await convertOggToMp3(oggPath, `${userId}.mp3`)

	const request = await transcription(mp3Path)
	ctx.session.messages.push(request)

	const response = await getResponse(ctx.session.messages)
	ctx.session.messages.push(response)

	await unlink(oggPath)
	await unlink(mp3Path)

	await ctx.reply(response.content)
})

bot.on(message('text'), async (ctx) => {
	ctx.session ??= initialSession

	const request = { role: 'user', content: ctx.message.text }
	ctx.session.messages.push(request)

	const response = await getResponse(ctx.session.messages)
	ctx.session.messages.push(response)

	await ctx.reply(response.content)
})

bot.launch()
