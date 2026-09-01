import axios from 'axios';
import {tool} from 'langchain';
import * as z from 'zod';


export const listFiles = tool(
    async ({ }) => {
        const response = await axios.get('http://01a05c47-e92f-7256-94b4-0384421ef725.agent.localhost/list-files');

        return JSON.stringify(response.data.files);
    },
    {
        name: "list_files",
        description: "List all the files in the project directory. This is useful for understanding what files are available to work with.",
        inputSchema: z.object({})
    }
);

export const readFiles = tool(
    async ({ files: []}) => {
        const response = await axios.get('http://01a05c47-e92f-7256-94b4-0384421ef725.agent.localhost/read-files?files='+ files.join(","));

        return JSON.stringify(response.data.files);
    },
    {
        name: "read_files",
        description:"Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        inputSchema: z.object({
            files: z.array(z.string()).describe("The list of files absolute paths to read.These should be files that were listed using the list_files tool or created later")
        })
    }
);

export const updatefiles = tool(
    async ({files}) => {
        const response = await axios.patch('http://01a05c47-e92f-7256-94b4-0384421ef725.agent.localhost/update-files', {
            updates: files
        });

        return JSON.stringify(response.data.results);
    },
    {
        name: "update_files",
        description: "Update the contents of specified files. This is useful for making changes to files based on the requirements of the task at hand.",
        inputSchema: z.object({
            files: z.array(z.object({
                file: z.string().describe("The absolute path of the file to update"),
                content: z.string().describe("The new content for the file")
            })).describe("The list of files to update and their new contents")
        })
    }
);