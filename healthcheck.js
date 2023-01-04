const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const URL = 'http://flosight.duckdns.org';

const checks = [];

//Check if UI is working and is type HTML
checks.push(function check_UI() {
    return new Promise((resolve, reject) => {
        fetch(URL).then(res => {
            if (!res.ok || res.status !== 200)
                return resolve(`UI fetch failed with status ${res.status}`);
            if (!res.headers.get('content-type').includes('text/html'))
                return resolve(`UI fetch: content-type not HTML`);
            //TODO: check DOM objects for UI
            resolve(true);
        }).catch(error => reject(error));
    })
});

//Check if the Sync is finished and 100%
checks.push(function check_API_sync() {
    return new Promise((resolve, reject) => {
        fetch(URL + '/api/sync').then(res => {
            if (!res.ok || res.status !== 200)
                return resolve(`Sync API fetch failed with status ${res.status}`);
            res.json().then(data => {
                if (data.error)
                    return resolve(`Sync API error: ${data.error}`);
                if (data.status !== "finished" || data.syncPercentage !== 100)
                    return resolve(`Sync not finished: current percentage ${data.syncPercentage}`);
                resolve(true);
            }).catch(error => resolve(`Sync API: response not JSON`))
        }).catch(error => reject(error));
    })
});

//Check if the last synced block time is not too old
checks.push(function check_lastBlockTime() {
    const ALLOW_BLOCK_DELAY = 60 * 60 * 1000; //1hr
    return new Promise((resolve, reject) => {
        fetch(URL + "/api/blocks?limit=1").then(res => {
            if (!res.ok || res.status !== 200)
                return resolve(`Last Block fetch with status ${res.status}`);
            res.json().then(data => {
                if (!data.blocks.length)
                    return resolve(`Last Block not found`);
                let last_block_no = data.blocks[0].height, last_block_time = data.blocks[0].time;
                last_block_time = last_block_time * 1000; //sec to ms
                if (last_block_time + ALLOW_BLOCK_DELAY < Date.now())
                    return resolve(`Last Block#${last_block_no} synced at ${last_block_time}`);
                resolve(true);
            }).catch(error => resolve(`Last Block API: response not JSON`))
        }).catch(error => reject(error))
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
}).catch(error => {
    console.debug("ERROR");
    console.error(error);
    process.exit(1);
})
