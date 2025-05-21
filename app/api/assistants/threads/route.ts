import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";
import fs from "fs";
import path from "path";
import dayjs from "dayjs";

export const runtime = "nodejs";

const FILE_PATH = path.join(process.cwd(), "app/api/assistants/threads/", `${assistantId}.json`);
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf8'); // Creates an empty JSON file
};
  
// Type definition for stored thread metadata
type ThreadEntry = { threadId: string; assistantId: string; created_at: number };

const readData = (): ThreadEntry[] => {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data);
};
const writeData = (data: ThreadEntry[]) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
};

// list threads
type Message = {
  role?: string;
  content?: Array<{ text?: { value?: string } }>;
};

export async function GET() {
  const threadList = readData() || [];

  const threadsWithMessages = await Promise.all(
    threadList.map(async (thread) => {
      const messagesResponse = await openai.beta.threads.messages.list(thread.threadId);
      const messages = messagesResponse.data as Message[];
      if (messages.length === 0) return null;

      const firstUserMessage = messages.find(msg => msg.role === "user");
      const fullText = firstUserMessage?.content?.[0]?.text?.value ?? "";

      const words = fullText.trim().split(/\s+/);
      const summary = words.length > 5 ? words.slice(0, 5).join(" ") + "..." : fullText;

      const threadDetails = await openai.beta.threads.retrieve(thread.threadId);

      return {
        thread_id: threadDetails.id,
        thread_created: dayjs.unix(threadDetails.created_at).format("h:mmA M/D/YYYY"),
        thread_summary: summary || "No user question found",
      };
    })
  );

  const filteredThreads = threadsWithMessages.filter(Boolean);

  return Response.json(filteredThreads);
}

// delete thread
export async function DELETE(request) {
  const body = await request.json();
  const threadId = body.threadId;
   // Delete thread from OpenAI
 //  await openai.thread.del(threadId); // delete thread
  let threads = readData();
  threads = threads.filter(thread => thread.threadId !== threadId);
  writeData(threads);

  const threadList = readData() || []; // Ensure it's always an array
  const threadIds: string[] = threadList.map((thread) => thread.threadId);

    await openai.beta.threads.del(threadId); // delete thread
  return new Response();
}

// Create a new thread
export async function POST() {
  const thread = await openai.beta.threads.create();
  // Store thread metadata
        const threads = readData();
        threads.push({ threadId: thread.id,assistantId, created_at:thread.created_at  });
        writeData(threads);
        const fileList = readData() || []; 
  return Response.json({ threadId: thread.id });
}
