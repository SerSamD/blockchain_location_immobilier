const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const output = path.join(__dirname, '..', 'demo.mp4');

const args = [
  '-y',
  '-framerate', '1',
  '-i', path.join(outDir, 'shot%02d.png'),
  '-c:v', 'libx264',
  '-r', '30',
  '-pix_fmt', 'yuv420p',
  output,
];

console.log('Running ffmpeg:', ffmpegPath, args.join(' '));

const p = spawn(ffmpegPath, args, { stdio: 'inherit' });

p.on('close', (code) => {
  if (code === 0) console.log('Video created at', output);
  else console.error('ffmpeg exited with code', code);
});
