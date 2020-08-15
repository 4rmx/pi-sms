const { spawn } = require('child_process');

// active
const ls = spawn('systemctl', ['is-active', 'bluetooth.service']);
// inactive
// const ls = spawn('systemctl', ['is-active', 'apt-daily.service']);

ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) console.log(true);
    console.log(false);
});
