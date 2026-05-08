const DEFAULT_MAX_HEIGHT = 720
const DEFAULT_MAX_WIDTH = 1280
const DEFAULT_VIDEO_BITRATE = 2_500_000
const DEFAULT_AUDIO_BITRATE = 128_000

function pickMimeType(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]

  for (const candidate of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) {
      return candidate
    }
  }

  return ''
}

export async function compressVideoTo720p(
  file: File,
  maxHeight: number = DEFAULT_MAX_HEIGHT,
  maxWidth: number = DEFAULT_MAX_WIDTH
): Promise<File> {
  if (typeof window === 'undefined') {
    return file
  }

  if (typeof document === 'undefined' || typeof MediaRecorder === 'undefined') {
    return file
  }

  const video = document.createElement('video')
  video.preload = 'auto'
  video.playsInline = true
  video.muted = true
  video.src = URL.createObjectURL(file)

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error('Unable to load video for compression'))
    })

    const originalWidth = video.videoWidth || maxWidth
    const originalHeight = video.videoHeight || maxHeight

    const scale = Math.min(
      1,
      maxWidth / originalWidth,
      maxHeight / originalHeight
    )

    const targetWidth = Math.max(2, Math.floor(originalWidth * scale / 2) * 2)
    const targetHeight = Math.max(2, Math.floor(originalHeight * scale / 2) * 2)

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d')
    if (!context) {
      return file
    }

    const mimeType = pickMimeType()
    const capturedStream = canvas.captureStream(30)
    const recordingStream = capturedStream

    const audioTracks = typeof (video as any).captureStream === 'function'
      ? (video as any).captureStream().getAudioTracks()
      : []

    for (const track of audioTracks) {
      recordingStream.addTrack(track)
    }

    const chunks: BlobPart[] = []
    const recorder = new MediaRecorder(recordingStream, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: DEFAULT_VIDEO_BITRATE,
      audioBitsPerSecond: DEFAULT_AUDIO_BITRATE,
    })

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    const recordingFinished = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType || file.type || 'video/webm' }))
      }

      recorder.onerror = () => {
        reject(new Error('Video compression failed'))
      }
    })

    const drawFrame = () => {
      if (video.paused || video.ended) {
        return
      }

      context.drawImage(video, 0, 0, targetWidth, targetHeight)
      requestAnimationFrame(drawFrame)
    }

    const playbackFinished = new Promise<void>((resolve, reject) => {
      video.onended = () => resolve()
      video.onerror = () => reject(new Error('Unable to play video for compression'))
    })

    recorder.start(250)
    await video.play()
    requestAnimationFrame(drawFrame)

    await playbackFinished
    recorder.stop()

    const compressedBlob = await recordingFinished
    const compressedFileName = file.name.replace(/\.[^.]+$/, '') + '.webm'

    return new File([compressedBlob], compressedFileName, {
      type: compressedBlob.type || 'video/webm',
      lastModified: Date.now(),
    })
  } catch (error) {
    console.error('compressVideoTo720p error', error)
    return file
  } finally {
    URL.revokeObjectURL(video.src)
    video.src = ''
  }
}