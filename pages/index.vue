<template>
  <div>
    <button @click="run()">run</button>
    <pre>{{ output }}</pre>
  </div>
</template>

<script>
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import axios from 'axios'

const blobToBase64 = (blob) => {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result)
    }
  })
}

export default {
  data: () => ({
    output: [],
  }),
  methods: {
    async run() {
      /**
       * 1. Download an audio file from internet.
       */

      const url =
        'https://traffic.omny.fm/d/clips/75853ef7-6019-417d-a769-ac7900677d7c/e93dfa05-4cda-42ea-975f-ac8800022ab8/6ebf1707-02a6-4ffc-aa81-ac88000ec7c5/audio.mp3'

      this.log('downloading...')

      const response = await axios.get(url, { responseType: 'arraybuffer' })

      const buffer = response.data
      const contentType = response.headers['content-type'] || 'audio/mpeg'
      const blob = new Blob([buffer], { type: contentType })

      this.log('file loaded', { buffer, blob, contentType })

      /**
       * 2. Save it to disk.
       */

      this.log('saving...')

      const path = 'downloads/audio.mp3'

      const saved = await Filesystem.writeFile({
        path,
        directory: Directory.Documents,
        data: await blobToBase64(blob),
        recursive: true,
      })

      this.log('saved', saved)

      /**
       * 3. play saved file on disk
       */

      const { uri } = await Filesystem.getUri({
        path,
        directory: Directory.Documents,
      })

      const src = Capacitor.convertFileSrc(uri)

      this.log('file to play', { uri, src })

      const audio = new Audio(src)
      audio.play()
    },
    log(message, input) {
      console.log(message, input)
      this.output.push(message)
      if (input) {
        this.output.push(input)
      }
    },
  },
}
</script>
