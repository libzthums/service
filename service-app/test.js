const frames = ['✶', '✸', '✹', '✺', '✹', '✸']; // Star spin pattern
let i = 0;

setInterval(() => {
  process.stdout.write(`\r${frames[i++]}`);
  i %= frames.length;
}, 150); // adjust speed as needed
