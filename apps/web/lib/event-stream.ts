
export const processStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,
  reloadProjectLink: () => void,
  onText?: (text: string) => void,
  onToolCall?: (toolData: any) => void,
  onQuestion?: (questionData: any) => void,
  onFileChange?: (toolName: string, args: any) => void,
) => {
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const raw of events) {
          if (!raw.trim()) continue;
          const eventMatch = raw.match(/^event: (.+)$/m);
          const dataMatch = raw.match(/^data: (.+)$/m);
          
          if (dataMatch) {
            const eventName = eventMatch ? eventMatch[1].trim() : "text";
            try {
              const data = JSON.parse(dataMatch[1]);
              console.log(eventName, data);

              if (eventName === "text" && onText) {
                const textContent = typeof data === "string" ? data : (data.content || data.text || JSON.stringify(data));
                onText(textContent);
              }

              if (eventName === "tool_call") {
                if (onToolCall) {
                  onToolCall(data);
                }

                // Fire onFileChange for file mutation tool calls
                if (onFileChange && data?.name) {
                  const toolName = data.name;
                  if (
                    toolName === "create_file_tool" ||
                    toolName === "update_file_tool" ||
                    toolName === "delete_file_tool"
                  ) {
                    onFileChange(toolName, data.arguments || {});
                  }
                }
              }

              if (eventName === "question" && onQuestion) {
                onQuestion(data);
              }

              if (eventName === "restart_project") {
                reloadProjectLink();
              }

            } catch (err) {
              console.error("Error parsing event stream message:", err);
            }
          }
        }
      }
      
      if (done) break;
    }
}