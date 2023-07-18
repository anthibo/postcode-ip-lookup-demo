const {
    Worker,
} = require('worker_threads');
const fs = require('fs');
const os = require('os')

const numOfCpus = os.cpus().length;
const THREAD_COUNT = numOfCpus;

// read data from stripe-users.json
const stripeUsers = JSON.parse(fs.readFileSync('./data/stripe-users.json', 'utf8'));

// function to write results to users-with-postcode.json
const writeResultsToFile = (usersResult) => {
    console.log(`writing user results to users-with-postcode.json`)
    fs.writeFile('./data/users-with-postcode.json', JSON.stringify(usersResult), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

function createWorker(stripeUsers) {
    return new Promise(function (resolve, reject) {
        const worker = new Worker("./worker.js", {
            workerData: {
                stripeUsers
            },
        });
        worker.on("message", (data) => {
            resolve(data);
        });
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`);
        });
    });
}

async function main() {
    const workerPromises = [];
    const stripeUsersLength = stripeUsers.length
    const stripeUsersCountPerThread = Math.floor(stripeUsersLength / THREAD_COUNT);
    for (let i = 0; i < THREAD_COUNT; i++) {
        const from = i * stripeUsersCountPerThread
        const to = from + stripeUsersCountPerThread
        const users = stripeUsers.slice(from, to)
        workerPromises.push(createWorker(users));
    }
    const thread_results = await Promise.all(workerPromises);
    const updatedUsers = [...thread_results]
    writeResultsToFile(updatedUsers)
}

main()