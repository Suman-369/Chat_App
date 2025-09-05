// Import the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding

const ChatappIndex = pc.Index("chat-app");

async function createMemory({ vectors, metadata, messageId }) {
  await ChatappIndex.upsert([
    {
      id: messageId,
      values: vectors,
      metadata,
    },
  ]);
}


async function queryMemory({queryvector , limit = 5 , metadata}){


const data = await ChatappIndex.query({
    vector : queryvector,
    topK : limit,
    filter:metadata ? metadata: undefined,
    includeMetadata : true
})

return data.matches

} 


module.exports = {
    createMemory,queryMemory
}