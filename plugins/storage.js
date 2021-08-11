/* eslint-disable camelcase */
/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */

import { Filesystem, Directory } from '@capacitor/filesystem'
import write_blob from 'capacitor-blob-writer'
import axios from 'axios'

const base64ToBlob = async (base64, contentType = 'audio/mpeg') => {
  const base64Response = await fetch(`data:${contentType};base64,${base64}`)
  return await base64Response.blob()
}

const blobToBase64 = (blob) => {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result)
    }
  })
}

export default ({ app, store }, inject) => {
  inject('storage', {
    async start() {
      /**
       * 1. Download an audio file from internet.
       */

      const url =
        'https://traffic.omny.fm/d/clips/75853ef7-6019-417d-a769-ac7900677d7c/e93dfa05-4cda-42ea-975f-ac8800022ab8/6ebf1707-02a6-4ffc-aa81-ac88000ec7c5/audio.mp3'

      console.log('downloading...')

      const response = await axios.get(url, { responseType: 'arraybuffer' })

      const buffer = response.data
      const contentType = response.headers['content-type'] || 'audio/mpeg'
      const blob = new Blob([buffer], { type: contentType })

      console.log('file loaded', { response, buffer, blob, contentType })

      /**
       * 2. Save it to disk.
       */

      console.log('saving...')

      const path = 'downloads/audio.mp3'

      const uri = await write_blob({
        path,
        directory: Directory.Documents,
        blob,
        recursive: true,
        on_fallback(error) {
          console.log({ wb__error: error })
        },
      })

      console.log('file saved to disk.', { uri })

      /**
       * 3. load file from disk
       */

      console.log('loading...')

      const { data } = await Filesystem.readFile({
        path,
        directory: Directory.Documents,
        // encoding: Encoding.UTF8,
      })

      console.log('file loaded', { data })
    },
  })
}
