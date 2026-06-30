import { bashTool, bashToolHandler } from "./bash";
import { createFileTool, createFileToolHandler } from "./create-file";
import { deleteFileTool, deleteFileToolHandler } from "./delete-file";
import { qnaTool, qnaToolHandler } from "./qna";
import { readFileTool, readFileToolHandler } from "./read-file";
import { udpateFileTool, updateFileToolHandler } from "./update-file";

export const tools = [qnaTool,bashTool,readFileTool,createFileTool,udpateFileTool,deleteFileTool];

export const toolHandlers = {
    "qna_tool": qnaToolHandler,
    "bash_tool": bashToolHandler,
    "read_file_tool": readFileToolHandler,
    "create_file_tool": createFileToolHandler,
    "update_file_tool": updateFileToolHandler,
    "delete_file_tool": deleteFileToolHandler,
}