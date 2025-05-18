import arcjet, { tokenBucket } from "@arcjet/next";

const aj=arcjet({
    key: process.env.ARCJET_KEY as string,
    characteristics:['userId'],
    rules:[
        tokenBucket({
            mode:'LIVE',
            refillRate:1,
            interval:3600,
            capacity:10
        })
    ]
})
export default aj