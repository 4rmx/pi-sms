const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { SERVER_URL, PORT, Authorization, PI } = require('../config.json');
const logger = require('./lib/winston');
const axios = require('axios').default;
const si = require('systeminformation');

app.use(require('cors')());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use('/', express.static(path.join(__dirname, 'public')))

async function server() {
    try {

        const socket = require('socket.io-client')(`${SERVER_URL}/sms`, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        authorization: Authorization,
                        clientid: PI
                    }
                }
            },
        });

        socket.on('cpu', async (msg) => {
            try {
                logger.info(`cpu: ${msg}`);
                const cpu = await si.cpu()
                const cpuTemp = await si.cpuTemperature();

                socket.emit('cpu', {
                    cpu: cpu,
                    cpuTemp: cpuTemp
                })
            } catch (err) {
                logger.error(`${err.name} ${err.message} ${err.stack}`);
                socket.emit('error', `${err.name} ${err.message} ${err.stack}`)
            }
        });

        socket.on('service', async (name) => {
            try {
                logger.info(name);
                if (!name) return socket.emit('service', `name error`);
                const ps = require('child_process')
                    .spawn('systemctl', ['is-active', `${name}.service`]);

                ps.stdout.on('data', (data) => {
                    logger.debug(`stdout: ${data}`);
                });

                ps.stderr.on('data', (data) => {
                    logger.error(`stderr: ${data}`);
                });

                const resStatus = await new Promise((resolve, reject) => {
                    ps.on('close', (code) => {
                        logger.debug(`exited with code: ${code}`);
                        if (code === 0) resolve(true);
                        resolve(false);
                    });
                })
                // socket.emit('service', `${name}`)
                socket.emit('service', `${name}.service : ${resStatus}`)

            } catch (err) {
                logger.error(`${err.name} ${err.message} ${err.stack}`);
                socket.emit('error', `${err.name} ${err.message} ${err.stack}`)
            }
        });


        const httpServer = require('http').createServer(app);

        httpServer.listen(PORT, () => logger.info(`sms deposit listening on port ${PORT}`));

    } catch (err) {
        logger.error(`${err.name} ${err.message} ${err.stack}`)
        res.status(500).send(err.message);
    }
};

server();

app.get('/service/:name', async (req, res) => {
    const { name } = req.params
    try {
        if (!name) return res.status(400).send('name of service')

        // active
        const ps = require('child_process')
            .spawn('systemctl', ['is-active', `${name}.service`]);

        ps.stdout.on('data', (data) => {
            logger.debug(`stdout: ${data}`);
        });

        ps.stderr.on('data', (data) => {
            logger.error(`stderr: ${data}`);
        });

        const resStatus = await new Promise((resolve, reject) => {
            ps.on('close', (code) => {
                logger.debug(`exited with code: ${code}`);
                if (code === 0) resolve(true);
                resolve(false);
            });
        })

        res.send(`${name}.service : ${resStatus}`)

    } catch (err) {
        logger.error(`${err.name} ${err.message} ${err.stack}`)
        res.sendStatus(404)
    }
});

app.get('/cpu', async (req, res) => {
    try {
        res.send({
            cpu: await si.cpu(),
            cputemp: await si.cpuTemperature()
        })
    } catch (err) {
        logger.error(`${err.name} ${err.message} ${err.stack}`)
        res.sendStatus(404)
    }
});

app.get('/sms', async (req, res) => {
    const { limit } = req.query
    try {
        const sqlite3 = require('sqlite3').verbose();
        let db = new sqlite3.Database(require('path').join(__dirname, '../sms.db'));

        const resFind = await new Promise((resolve, reject) => {
            db.serialize(() => {
                let msgs = []
                db.each(`SELECT * FROM inbox ORDER BY create_at DESC LIMIT ${limit || 10}`, (err, row) => {
                    if (err) reject(err)
                    msgs.push(row)
                }, (err, n) => {
                    if (err) reject(err);
                    resolve(msgs);
                });
            });
        });

        db.close();
        res.send(resFind);

    } catch (err) {
        logger.error(`${err.name} ${err.message} ${err.stack}`)
        res.sendStatus(404)
    }
});

app.post('/sms', async (req, res) => {
    logger.info(JSON.stringify(req.body));
    // const { message, gateway, sender, time } = req.body
    try {
        axios({
            method: 'POST', url: `${SERVER_URL}/sms`,
            headers: { Authorization: Authorization },
            data: req.body
        }).then(({ data, status }) => {
            logger.info(`data: ${JSON.stringify(data)}, ${status}`);
            res.sendStatus(200)
        }).catch(err => {
            throw err
        })
    } catch (err) {
        logger.error(`${err.name} ${err.message} ${err.stack}`)
        res.sendStatus(404)
    }
});