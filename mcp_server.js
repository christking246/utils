const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { z } = require("zod");

const { generateHashes } = require("./services/hashGenerator.js");

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

module.exports.server = server;