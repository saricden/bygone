import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";


const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
const ffmpeg = new FFmpeg();

const maxFrames = (1000 * 15);
let frame = 0;

export function record15Seconds(canvas) {
  return new Promise((resolve) => {
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9"
    });
    let recordedChunks = [];
  
    mediaRecorder.start(frame);
  
    mediaRecorder.ondataavailable = function (e) {
      recordedChunks.push(e.data);
      frame++;
  
      if (frame >= maxFrames) {
        mediaRecorder.stop();
      }
    };
  
    mediaRecorder.onstop = function () {
      const blob = new Blob(recordedChunks, {
          "type": "video/webm"
      });
      const url = URL.createObjectURL(blob);

      resolve({url, blob});
    };
  });
}

export const loadFFmpeg = async () => {
  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    ),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });
};

export const transcode = (videoURL, filename) => {
  return new Promise(async (resolve) => {
    await ffmpeg.writeFile(filename, await fetchFile(videoURL));
    await ffmpeg.exec(["-i", filename, "output.mp4"]);
    const fileData = await ffmpeg.readFile('output.mp4');
    const data = new Uint8Array(fileData);
    
    resolve(new Blob([data.buffer], { type: 'video/mp4' }));
  });
};



// export async function dlGameplayVideo() {
//   const canvas = document.getElementById('game');
//   const filename = `Bygone${Date.now()}.mp4`;
//   console.log('Begin recording...');
//   const video = await record15Seconds(canvas);
//   console.log('Transcoding...');
//   const blob = await transcode(video.url, filename);

//   return blob;
// }