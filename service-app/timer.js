let seconds = 0;
let interval = null;

function updateDisplay() {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  process.stdout.write(`\r${mins}:${secs}`);
}

function startTimer() {
  if (!interval) {
    interval = setInterval(() => {
      seconds++;
      updateDisplay();
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  stopTimer();
  seconds = 0;
  updateDisplay();
}

console.log("Press 's' to start, 'p' to pause, 'r' to reset, 'q' to quit.");
updateDisplay();

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (key) => {
  if (key === 's') startTimer();
  else if (key === 'p') stopTimer();
  else if (key === 'r') resetTimer();
  else if (key === 'q') {
    stopTimer();
    console.log('\nExiting.');
    process.exit();
  }
});
