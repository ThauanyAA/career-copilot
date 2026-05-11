import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { getMongodbTool } from "../tools/mongodbTool";
import { getFileSystemTool } from "../tools/fileSystemTool";

export const getMCPTools = async () => {
  
  const client = new MultiServerMCPClient({
    mcpServers: {
      ...getMongodbTool(),
      ...getFileSystemTool()
    },
    onMessage: (log, source) => {
      console.log(`[${source.server}]`, log.data);
    }
  })

  const mcpTools = await client.getTools();

  return [
    ...mcpTools
  ];
};
