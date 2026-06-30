import { bashTool, bashToolHandler } from "./bash";
import { buildProjectTool, buildProjectToolHandler } from "./build-project";
import { createFileTool, createFileToolHandler } from "./create-file";
import { deleteFileTool, deleteFileToolHandler } from "./delete-file";
import { qnaTool, qnaToolHandler } from "./qna";
import { readFileTool, readFileToolHandler } from "./read-file";
import { runProjectTool, runProjectToolHandler } from "./run-project";
import { udpateFileTool, updateFileToolHandler } from "./update-file";

export const tools = [qnaTool,bashTool,readFileTool,createFileTool,udpateFileTool,deleteFileTool,buildProjectTool,runProjectTool];

export const toolHandlers = {
    "qna_tool": qnaToolHandler,
    "bash_tool": bashToolHandler,
    "read_file_tool": readFileToolHandler,
    "create_file_tool": createFileToolHandler,
    "update_file_tool": updateFileToolHandler,
    "delete_file_tool": deleteFileToolHandler,
    "build_project_tool": buildProjectToolHandler,
    "run_project_tool": runProjectToolHandler,
}