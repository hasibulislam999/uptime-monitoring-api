/**
 * Title: Simple request & response handler
 * Description: A handler that handle request and response form server
 * Author: Hasibul Islam
 * Date: 14/07/2022
 */

// dependency
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../utilities/routes');
const { notFoundHandler } = require('../routes/notFoundHandler');
const { parseJSON } = require('../utilities/userUtils');

// handle object - module scaffolding
const handler = {};

// handle request and response
handler.handleReqRes = (req, res) => {
    /* handling request */
    // get the url, path & parse it
    const parsedURL = url.parse(req.url, true);

    // get full path
    const path = parsedURL.pathname;

    // trim unwanted front and back froward slash of a path
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // which method going to be usedd
    const method = req.method.toLowerCase();

    // get query of a path as object form
    const queryStringObject = parsedURL.query;

    // get headers as an object form
    const headersObject = req.headers;

    // convert to an object of all request properties
    const requestProperties = {
        parsedURL,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject
    };

    // get requested string
    const decoder = new StringDecoder('utf-8');
    let realData = '';

    // choose route handler
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        // start writing data on real data file
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        // stop writing data on real data file
        realData += decoder.end();

        // add new user object within request property
        requestProperties["userInfo"] = parseJSON(realData);

        // pass request properties to chosen handler
        chosenHandler(requestProperties, (statusCode, payload) => {
            // validate status code and payload
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500;
            payload = typeof (payload) === 'object' ? payload : {};

            // convert payload to stringify payload as JSON format
            const stringifiedPayload = JSON.stringify(payload);

            // passed data convert to json format
            res.setHeader('content-type', 'application/json');

            // return final response
            res.writeHead(statusCode);
            res.end(stringifiedPayload);
        });
    })
}

/* export module as external module */
module.exports = handler;
