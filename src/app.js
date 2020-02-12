"use-strict";
const express = require("express");
const env = require("dotenv");
const request = require("request");
const body_parser = require("body-parser");
const main = express().use(body_parser.json());
env.config();
main.set("port", process.env.PORT || 5000);
main.use(body_parser.urlencoded({ extended: false }));
const TOKEN = process.env.PAGE_ACCESS_TOKEN;
main.listen(main.get("port"), () => console.log("webhook running"));

main.get("/", (req, resp) => {
    resp.send("Welcome to Chill Bro");
});

/* Token verification */
main.get("/webhook/", (req, res) => {
    let VERIFIC_TOKEN = "secret_maata";
    let mode = req.query["hub.mode"];
    let Token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && Token) {
        if (Token === VERIFIC_TOKEN && mode === "subscribe") {
            res.status(200).send(challenge);
        } else {
            res.send("Wrong Token");
            res.sendStatus(403);
        }
    }
});

//post webhook handling post backs

main.post("/webhook", (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        console.log("here the page responses ====>>>> ", JSON.stringify(body));
        console.log();
        body.entry.forEach(entry => {
            const event = entry.messaging[0];
            const sender_id = event.sender.id;
            const recipient_id = event.recipient.id;
            const timestamp = event.timestamp;
            if (
                event.message &&
                event.message.text &&
                typeof event.message.quick_reply == "undefined"
            ) {
                const message = event.message.text;
                if (message.search("hi" || "hello") !== -1) {
                    console.log("it is message now", message);
                }
                //getStartedHandler(sender_id);
                //inMsg_handler(sender_id, timestamp, message);
            } else if (event.message.quick_reply) {
                const payload = event.message.quick_reply.payload;
                switch (payload) {
                    case "MENU_CLICKED":
                        console.log("menu clicked");
                        menuHandler(sender_id);
                        res.status(200).send("OK");
                        break;
                    case "QUERY_START":
                        queryHandler(sender_id);
                        res.status(200).send("OK");
                        break;
                }
            } else if (event.postback) {
                switch (event.postback.payload) {
                    case "GET_STARTED":
                        getStartedHandler(sender_id);
                        res.status(200).send("EVENT_RECEIVED");
                        break;
                }
            }
        });
    } else {
        res.sendStatus(404);
    }
});

//request body structure
function postBackHandler(sender_id, message, quick_replies = []) {
    let replies = quick_replies;
    let msg_body =
        quick_replies.length === 0 ?
        {
            text: message
        } :
        {
            text: "{{user_first_name}}" + message,
            quick_replies: replies
        };
    let response_body = {
        recipient: {
            id: sender_id
        },

        message: msg_body
    };

    sendApi(response_body);
}
//Request
function sendApi(response_body) {
    console.log("came ghere");
    request({
            uri: "https://graph.facebook.com/v2.6/me/messages",
            qs: {
                access_token: TOKEN
            },
            method: "POST",
            json: response_body
        },
        (err, response, body) => {
            console.log(response);
            if (!err) console.log("message sent bro");
            else console.log(`unable to sent the message bro => ${err}`);
        }
    );
}

//handlers
function getStartedHandler(sender_id) {
    const welcome_msg =
        "Namasthey {{user_first_name}} ! Welcome to chill Bro 😎 🍽️ healthy food. Order or subscribe now, and get free health checkup at your home.";
    const quick_replies = [{
            content_type: "text",
            title: "Box Suggestions",
            payload: "MENU_CLICKED",
            image_url: "https://img.icons8.com/ios/50/000000/give-gift.png"
        },
        {
            content_type: "text",
            title: "Talk to us",
            payload: "QUERY_START",
            image_url: "https://img.icons8.com/ios/50/000000/technical-support.png"
        }
    ];
    postBackHandler(sender_id, welcome_msg, quick_replies);
}

function menuHandler(sender_id) {
    const menu_courousel_data = {
        recipient: { id: sender_id },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [{
                        title: "Snuhi GF - A healthy, fresh, delicious box - just eat and feel the energy",
                        image_url: "",
                        subtitle: "₹100",
                        buttons: [{
                                type: "postback",
                                title: "View details",
                                payload: "VIEW_DETAILS"
                            },
                            {
                                type: "postback",
                                title: "Shop this",
                                payload: "SHOP_CLICKED"
                            }
                        ]
                    }]
                }
            }
        }
    };

    sendApi(menu_courousel_data);
}

function queryHandler(sender_id) {}