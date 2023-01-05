const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const URL = 'http://localhost:3001';

const checks = [];

//Check if UI is working and is type HTML
checks.push(function check_UI() {
    return new Promise(resolve => {
        fetch(URL).then(res => {
            if (!res.ok || res.status !== 200)
                return resolve(`UI fetch failed with status ${res.status}`);
            if (!res.headers.get('content-type').includes('text/html'))
                return resolve(`UI fetch: content-type not HTML`);
            //TODO: check DOM objects for UI
            resolve(true);
        }).catch(err => resolve(err));
    })
});

//Check if the Sync is finished and 100%
checks.push(function check_API_sync() {
    return new Promise(resolve => {
        fetch(URL + '/api/sync').then(res => {
            if (!res.ok || res.status !== 200)
                return resolve(`Sync API fetch failed with status ${res.status}`);
            res.json().then(data => {
                if (data.error)
                    return resolve(`Sync API error: ${data.error}`);
                if (data.status !== "finished" || data.syncPercentage !== 100)
                    return resolve(`Sync not finished: current percentage ${data.syncPercentage}`);
                resolve(true);
            }).catch(err => resolve(`Sync API: response not JSON`))
        }).catch(err => resolve(err));
    })
});

function getBlockHeight_coreWallet() {
    return new Promise((resolve, reject) => {
        fetch('https://ranchimallflo.duckdns.org/api/v2.0/flocoreHeight').then(res => {
            if (!res.ok || res.status !== 200)
                return reject(`Get blockchain height failed with status ${res.status}`);
            res.json().then(data => resolve(data.blocks))
                .catch(err => reject(`Get blockchain height: response not JSON`))
        }).catch(err => reject(err))
    })
}

//Check if the last synced block is matched with flo core wallet
checks.push(function check_lastBlock() {
    return new Promise(resolve => {
        fetch(URL + "/api/blocks?limit=1").then(res => {
            if (!res.ok || res.status !== 200)
                return resolve(`Last Block fetch with status ${res.status}`);
            res.json().then(data => {
                if (!data.blocks.length)
                    return resolve(`Last Block not found`);
                let last_block_no = data.blocks[0].height;
                getBlockHeight_coreWallet().then(blockchain_height => {
                    if (blockchain_height != last_block_no)
                        return resolve(`Last Block#${last_block_no}. Blockchain height=${blockchain_height}`);
                    resolve(true);
                }).catch(err => {
                    console.error('Soft-check:', err);
                    //Unable to get block height from core wallet, ignore case
                    resolve(true)
                })
            }).catch(err => resolve(`Last Block API: response not JSON`))
        }).catch(err => resolve(err))
    })
})
Promise.all(checks.map(c => c())).then(results => {
    let reasons = results.filter(r => r !== true);
    if (!reasons.length) {
        console.debug("HEALTHY");
        process.exit(0);
    } else {
        console.debug("UNHEALTHY");
        console.debug(reasons);
        process.exit(1);
    }
}).catch(err => {
    console.debug("ERROR");
    console.error(err);
    process.exit(1);
})
