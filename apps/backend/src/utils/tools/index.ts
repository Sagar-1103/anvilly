import type { ToolDefinition } from "../../providers/types";
import { bashTool, bashToolHandler } from "./bash";
import { buildProjectTool, buildProjectToolHandler } from "./build-project";
import { deleteFileTool, deleteFileToolHandler } from "./delete-file";
import { qnaTool, qnaToolHandler } from "./qna";
import { readFileTool, readFileToolHandler } from "./read-file";
import { runProjectTool, runProjectToolHandler } from "./run-project";
import { writeFileTool, writeFileToolHandler } from "./write-file";

export const tools: ToolDefinition[] = [
    qnaTool,
    bashTool,
    readFileTool,
    writeFileTool,
    deleteFileTool,
    buildProjectTool,
    runProjectTool,
];

export const toolHandlers = {
    "qna_tool": qnaToolHandler,
    "bash_tool": bashToolHandler,
    "read_file_tool": readFileToolHandler,
    "write_file_tool": writeFileToolHandler,
    "delete_file_tool": deleteFileToolHandler,
    "build_project_tool": buildProjectToolHandler,
    "run_project_tool": runProjectToolHandler,
};