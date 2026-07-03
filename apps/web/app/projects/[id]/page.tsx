"use client";

import { use, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { processStream } from "@/lib/event-stream";
import axios from "axios";
import ChatSidebar from "@/components/project/chat-sidebar";
import RightHeader from "@/components/project/right-header";
import PreviewViewport from "@/components/project/preview-viewport";
import { toast } from "sonner";
import { Project } from "@/lib/types";

export default function ProjectIDEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const { data: session } = useSession();
  const [project,setProject] = useState<Project>({title:"",url:""});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadProjectLink = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.src = iframe.src;
    toast.success(`Website Reloaded`)
  }

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
        const { title, url, messages, userPrompt } = res.data;
        setProject({url:url,title:title});
        if(messages.length===0) {
          await sendPrompt(userPrompt);
        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    if (session?.jwtToken && projectId) {
      getProject();
    }
  },[session,projectId]);

  const sendPrompt = async(userPrompt:string) => {
    const response = await fetch(`http://localhost:3001/api/projects/${projectId}`,{
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${session?.jwtToken}`
      },
      method:"POST",
      body:JSON.stringify({userPrompt}),
    });

    const reader = response.body?.getReader();

    if (!reader) return;

    await processStream(reader,reloadProjectLink);
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": "400px", "--sidebar-width-icon": "0px" } as React.CSSProperties}
    >
      <div className="flex h-screen w-screen bg-black text-white overflow-hidden antialiased">
        {/* LEFT: shadcn Sidebar */}
        <ChatSidebar project={project} sendPrompt={sendPrompt} />

        {/* RIGHT: Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <RightHeader device={device} setDevice={setDevice} activeTab={activeTab} setActiveTab={setActiveTab} reloadProjectLink={reloadProjectLink} project={project} />
          <PreviewViewport device={device} activeTab={activeTab} projectUrl={project.url} iframeRef={iframeRef} />
        </main>
      </div>
    </SidebarProvider>
  );
}

