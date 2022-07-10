'use strict';

import https from 'https';
import fs from 'fs';


const main = async () => {

    // input video url
    let inputVideoUrl = 'https://vimeo.com/712159936/';

    // check is there ending slash and remove it
    if (inputVideoUrl.slice(-1) === '/') {
        inputVideoUrl = inputVideoUrl.slice(0, -1);
    }

    // get video id from url
    const videoId = inputVideoUrl.split('/').pop();


    // video json config url
    const videoJsonConfigUrl = `https://player.vimeo.com/video/${videoId}/config`;

    // get video json config
    const videoConfig = await new Promise((resolve, reject) => {

        https.get(videoJsonConfigUrl, (res) => {

            let result = '';

            res.on('data', data => {
                result += data;
            });

            res.on('error', err => {
                reject(err);
            });

            res.on('end', () => {
                resolve(JSON.parse(result));
            });

        });
    });

    // video quality items
    const videoQualityItems = videoConfig.request.files.progressive;

    // selecting the best video quality based on height and width
    // you could also FPS multiplication to get the best quality based on FPS too
    const targetItem = videoQualityItems.reduce((prev, curr) => {
        return prev.width * prev.height > curr.width * curr.height ? prev : curr;
    });

    // select file url
    const targetVideoFileUlr = targetItem.url;
    const localPath = `./${videoId}-${targetItem.quality}.mp4`;

    // download it
    await new Promise((resolve, reject) => {

            https.get(targetVideoFileUlr, (res) => {

                const file = fs.createWriteStream(localPath);

                res.pipe(file);

                res.on('error', err => {
                    reject(err);
                });

                res.on('end', () => {
                    resolve();
                });

            });
    });
}

const promise = main();

promise.then(() => {
    console.log('Program finished!');
});

promise.catch((err) => {
    console.log('Program finished with error!');
    console.log(err);
});