import 'dotenv/config'
import { ChatMistralAI } from '@langchain/mistralai';
import {listFiles, updatefiles, readFiles} from './tools.js'
import { createAgent } from 'langchain';

const model = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
});


const agent = createAgent({
    model,
    tools: [listFiles, readFiles, updatefiles],
});

await agent.invoke({
    messages:[
        {
            role: "user",
            content: "update the theme of the project to light"
        }
    ]
});

export default agent;
