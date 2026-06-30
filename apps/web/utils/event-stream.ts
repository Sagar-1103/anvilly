import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const processStream = async (reader:ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>,router:AppRouterInstance) => {
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
            const eventName = eventMatch ? eventMatch[1] : "text";
            const data = JSON.parse(dataMatch[1]);
            console.log(eventName, data);

            // if (eventName==="project") {
            //     router.push(`/projects/${data.id}`);
            // }

          }
        }
      }
      
      if (done) break;
    }
}