import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import { dirname, resolve } from 'path'
import { unlink } from 'fs/promises'

export default function convertOggToMp3(filepath, filename) {
	ffmpeg.setFfmpegPath(installer.path)
	const mp3FilePath = resolve(dirname(filepath), filename)

	return new Promise((resolve) => {
		ffmpeg(filepath)
			.inputOption('-t 30')
			.output(mp3FilePath)
			.on('end', () => unlink(filepath).then(resolve()))
			.run()
	})
}
