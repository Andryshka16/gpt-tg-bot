import config from 'config'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import downloadFile from '../utils/downloadFile.js'
import convertOggToMp3 from '../utils/convertToMp3.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.on(message('voice'), async (ctx) => {
	const link = (await ctx.telegram.getFileLink(ctx.message.voice.file_id)).href
	const userId = await ctx.message.from.id

	const oggPath = await downloadFile(link, `${userId}.ogg`)
	const mp3Path = await convertOggToMp3(oggPath, `${userId}.mp3`)

	await ctx.reply(mp3Path)
})

bot.on(message('text'), async (ctx) => {
	await ctx.reply(ctx.message)
})

bot.command('start', async (ctx) => {
	await ctx.reply('Welcome!')
})

bot.launch()
