import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { dirname, resolve } from 'path'

ffmpeg.setFfmpegPath(installer.path)

async function convertOggToMp3(filepath, filename) {
	const mp3FilePath = resolve(dirname(filepath), filename)

	await new Promise((resolve) => {
		ffmpeg(filepath)
			.inputOption('-t 30')
			.output(mp3FilePath)
			.on('end', () => resolve())
			.run()
	})

	return mp3FilePath
}

export default convertOggToMp3
