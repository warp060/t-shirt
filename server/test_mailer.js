require('dotenv').config();
const { sendCustomServiceNotification } = require('./mailer');

async function test() {
    console.log("Testing email sending...");
    // create a dummy 1x1 transparent png base64
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    
    const design = {
        userId: 999,
        description: "Test description from scratch script",
        imageUrl: dummyImage
    };

    try {
        await sendCustomServiceNotification(design);
        console.log("Test finished.");
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
