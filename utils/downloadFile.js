import axios from 'axios'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(resolve(fileURLToPath(import.meta.url)))

async function downloadFile(url, filename) {
	const filepath = resolve(__dirname, '../voices', filename)

	const response = await axios({
		method: 'get',
		url,
		responseType: 'stream',
	})
	
	return new Promise((resolve) => {
		const stream = createWriteStream(filepath)
		response.data.pipe(stream)
		stream.on('finish', () => resolve(filepath))
	})
}

export default downloadFile