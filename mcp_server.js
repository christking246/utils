const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { z } = require("zod");

const { generateHashes, generateGuid } = require("./services/Generators.js");
const { decodeJwt } = require("./services/JwtDecoder.js");
const { convertTime } = require("./services/TimeConverter.js");
const { describeCron } = require("./services/Cron.js");

const server = new McpServer({
    name: "util-server",
    version: "1.0.0" // should this match the api server version?
});

server.registerTool(
    "echo",
    {
        title: "Echo Tool",
        description: "Echoes back the provided message",
        inputSchema: { message: z.string() }
    },
    async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }]
    })
);

server.registerTool(
    "hash",
    {
        title: "Generate Hashes",
        description: "Generates SHA1, SHA256, SHA512, and MD5 hashes for the provided input string",
        inputSchema: { text: z.string() }
    },
    ({ text }) => {
        const { success, hashes, msg } = generateHashes(text);
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(hashes) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while generating the hashes " + msg }]
            }
        }
    }
);

server.registerTool(
    "jwtDecoder",
    {
        title: "JWT Decoder",
        description: "Decodes a JWT token and returns its header and payload",
        inputSchema: { token: z.string() }
    },
    ({ token }) => {
        const { success, payload, header, msg } = decodeJwt(token);
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify({ header, payload }) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while decoding the token " + msg }]
            }
        }
    }
);

server.registerTool(
    "timeConverter",
    {
        title: "Time Converter",
        description: "Converts a provided time input into ISO, UTC, and Unix timestamp formats",
        inputSchema: { time: z.string() }
    },
    ({ time }) => {
        const { success, msg, ...formats } = convertTime({ time });
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(formats) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while converting the input time value " + msg }]
            }
        }
    }
);

server.registerTool(
    "guid",
    {
        title: "Generate GUIDs",
        description: "Generates one or more GUIDs (Globally Unique Identifiers)",
        inputSchema: { count: z.number().optional() }
    },
    ({ count }) => {
        const { success, guids, msg } = generateGuid(count ?? 1);
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(guids) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while generating Guids " + msg }]
            }
        }
    }
);

server.registerTool(
    "cron",
    {
        title: "Describe Cron Expression",
        description: "Provides a human-readable description of a given cron expression",
        inputSchema: { expression: z.string() }
    },
    ({ expression }) => {
        const { success, description, msg } = describeCron(expression);
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(description) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while describing cron expression " + msg }]
            }
        }
    }
);

module.exports.server = server;