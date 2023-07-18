const {
    workerData,
    parentPort
} = require("worker_threads");

const {
    stripeUsers
} = workerData

const {
    fetchPostCodeFromIPAddress
} = require('./ip-lookup')

const getPostCode = async () => {
    const usersResult = []
    for (const user of stripeUsers) {
        const {
            ip
        } = user;
        const postCode = await fetchPostCodeFromIPAddress(ip);
        console.log(`post code: ${postCode} for user`);
        user.post_code = postCode;
        usersResult.push(user)
    };
    return usersResult;
}

async function main() {
    const usersResults = await getPostCode()
    parentPort.postMessage(usersResults);
}

main()