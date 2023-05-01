import dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { getResponse, transcription } from '../utils/openai.js'
import { unlink } from 'fs/promises'
import { initialSession, replyOptions, errorMessages } from './constants.js'
import downloadFile from '../utils/downloadFile.js'
import convertOggToMp3 from '../utils/convertToMp3.js'

dotenv.config()

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.use(session())

bot.command('start', async (ctx) => {
	ctx.session = initialSession
	await ctx.reply('Welcome, feel free to ask me something!')
})
bot.command('new', async (ctx) => {
	ctx.session = initialSession
	await ctx.reply('Cleared conversation, feel free to ask me something!')
})

bot.on(message('voice'), async (ctx) => {
	ctx.session ??= initialSession

	const link = (await ctx.telegram.getFileLink(ctx.message.voice.file_id)).href
	const userId = await ctx.message.from.id

	const oggPath = await downloadFile(link, `${userId}.ogg`)
	const mp3Path = await convertOggToMp3(oggPath, `${userId}.mp3`)

	try {
		const request = await transcription(mp3Path)
		ctx.session.messages.push(request)
	} catch (error) {
		await ctx.reply(errorMessages.requestError, replyOptions)
	}

	try {
		const response = await getResponse(ctx.session.messages)
		ctx.session.messages.push(response)
		await ctx.reply(response.content)
	} catch (error) {
		await ctx.reply(errorMessages.responseError, replyOptions)
	}

	await unlink(oggPath)
	await unlink(mp3Path)
})

bot.on(message('text'), async (ctx) => {
	ctx.session ??= initialSession

	try {
		const request = { role: 'user', content: ctx.message.text }
		ctx.session.messages.push(request)
	} catch (error) {
		await ctx.reply(errorMessages.requestError, replyOptions)
	}

	try {
		const response = await getResponse(ctx.session.messages)
		ctx.session.messages.push(response)
		await ctx.reply(response.content)
	} catch (error) {
		await ctx.reply(errorMessages.responseError, replyOptions)
	}
})

bot.launch()
