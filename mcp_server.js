const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { z } = require("zod");

const { generateHashes, generateGuid } = require("./services/Generators.js");
const { decodeJwt } = require("./services/JwtDecoder.js");
const { convertTime } = require("./services/TimeConverter.js");
const { describeCron } = require("./services/Cron.js");
const { formatMarkdownTable } = require("./services/Formatter.js");
const { compareImage } = require("./services/CompareImage.js");
const { optimizeSvg } = require("./services/SvgMinimizer.js");

const server = new McpServer({
    name: "util-server",
    version: global.VERSION
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

server.registerTool(
    "md_formatter",
    {
        title: "Markdown Formatter",
        description: "Formats a markdown table with correct spacing and alignment for improved raw readability",
        inputSchema: { table: z.string() }
    },
    ({ table }) => {
        const { success, table: formattedTable, msg } = formatMarkdownTable(table);
        if (success) {
            return {
                content: [{ type: "text", text: JSON.stringify(formattedTable) }]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while formatting the markdown table " + msg }]
            }
        }
    }
);

server.registerTool(
    "compare_img",
    {
        title: "Image Comparator",
        description: "Compares two images and highlights the differences",
        inputSchema: {
            image1: z.string().nonempty(),
            image2: z.string().nonempty(),
            threshold: z.number().optional(),
            resize: z.boolean().optional()
        }
    },
    ({ image1, image2, threshold, resize }) => {
        const { success, imageDiff, msg, percent } = compareImage(image1, image2, threshold, resize);
        if (success) {
            return {
                content: [
                    { type: "text", text: JSON.stringify({ imageDiff, percent }) }
                ]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while comparing the images " + msg }]
            }
        }
    }
);

server.registerTool(
    "optimize_svg",
    {
        title: "SVG Optimizer",
        description: "Optimizes SVG images for reduced file size",
        inputSchema: { svgString: z.string().nonempty() }
    },
    ({ svgString }) => {
        const { success, optimizedSvg, diff, msg } = optimizeSvg({ svgString });
        if (success) {
            return {
                content: [
                    { type: "text", text: JSON.stringify({ optimizedSvg, sizeDiff: diff }) }
                ]
            }
        }
        else {
            return {
                content: [{ type: "text", text: "An error occurred while optimizing the SVG image " + msg }]
            }
        }
    }
);

module.exports.server = server;