"use client";

import { use, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { processStream } from "@/lib/event-stream";
import axios from "axios";
import ChatSidebar from "@/components/project/chat-sidebar";
import RightHeader from "@/components/project/right-header";
import PreviewViewport from "@/components/project/preview-viewport";


export default function ProjectIDEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const { data: session } = useSession();

  const getProject = async() => {
    try {
      const response = await axios.get(`http://localhost:3001/api/projects/${projectId}`,{
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${session?.jwtToken}`
        }
      });
      const res = await response.data;

      if (res.success) {
        const history = res.project.history;
        if(history.length===0) {
          const userPrompt = res.project.prompt;
          const updateResponse = await fetch(`http://localhost:3001/api/projects/${projectId}`,{
            headers:{
              "Content-Type":"application/json",
              "Authorization":`Bearer ${session?.jwtToken}`
            },
            method:"POST",
            body:JSON.stringify({userPrompt}),
          });

          const reader = updateResponse.body?.getReader();

          if (!reader) return;

          await processStream(reader);

        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    if (session?.jwtToken) {
      getProject();
    }
  },[session])

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": "400px", "--sidebar-width-icon": "0px" } as React.CSSProperties}
    >
      <div className="flex h-screen w-screen bg-black text-white overflow-hidden antialiased">
        {/* LEFT: shadcn Sidebar */}
        <ChatSidebar />

        {/* RIGHT: Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <RightHeader device={device} setDevice={setDevice} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PreviewViewport device={device} activeTab={activeTab} />
        </main>
      </div>
    </SidebarProvider>
  );
}

