import express from 'express'
import { ipcMain } from 'electron'

function mainTest() {
    console.log('test main')
    console.log("ServerQueries.ts mainTest() called")
    console.log();
}

function startServer() {
    ipcMain.on('launchMissileRequest', () => {
        console.log("ServerQueries.ts: received launch missile request from renderer")
        launchQuery();
    })
    ipcMain.on('launcherLocPing', (event, x: number, y: number) => {
        console.log(`ServerQueries.ts: received launcher location ping from renderer: x=${x}, y=${y}`)
        launcherLocQuery(x, y);
        // Here you can handle the x and y coordinates as needed
    })
    const server = express()
    const port = 3000

    server.listen(port, () => {
        console.log(`ServerQueries.ts: Server is running on http://localhost:${port}`)
    })

    server.get('/', (req, res) => {
        res.send('Hello from the server!')
    })
    testQuery();

    console.log("ServerQueries.ts: startServer() END\n")
}

async function testQuery() {
    // Using this testURL because it's free and open
    const testURL = 'https://jsonplaceholder.typicode.com/todos/1'
    const response = await fetch(testURL);
    const data = await response.json();
    console.log(data);
    console.log("ServerQueries.ts: testQuery() END\n")
}

// url will need to be changed for PROD
async function launchQuery() {
    const url = 'http://localhost:3003/pingMissileLaunch';
    const data = await fetch(url).catch((error) => {
        console.error("Error in launchQuery():", error);
    })
}

async function launcherLocQuery(x: number, y: number) {
    const url = `http://localhost:3003/pingLauncherLoc`;
    const payload = { x, y };
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
}

export {mainTest, startServer, testQuery, launchQuery}