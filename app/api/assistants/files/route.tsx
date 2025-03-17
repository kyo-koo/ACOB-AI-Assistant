import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "app/api/assistants/codeInterpreter/", `${assistantId}.json`);
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf8'); // Creates an empty JSON file
};
// Type definition for stored file metadata
type FileEntry = { fileId: string; filename: string; assistantId: string };

const readData = (): FileEntry[] => {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data) as FileEntry[];
};
const writeData = (data: FileEntry[]) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
};

// upload file to assistant's vector store
export async function POST(request) {
  const formData = await request.formData(); // process file as FormData
  const file = formData.get("file") as File; // retrieve the single file from FormData
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store

  // upload using the file stream
  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  
  const fileExtension = openaiFile.filename.split('.').pop().toLowerCase();
    if (fileExtension === 'csv' || fileExtension === 'xlsx') {
      // Run the first set of code
      await openai.beta.assistants.update(assistantId, {
        tool_resources: {
          code_interpreter: {
            file_ids: [openaiFile.id],
          },
        },
      });
    } else {
      // Run the second set of code
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: openaiFile.id,
      });

  }
  // Store file metadata
  const files = readData();
  files.push({ fileId: openaiFile.id, filename: file.name, assistantId });
  writeData(files);
  return new Response(JSON.stringify({ success: true, fileId: openaiFile.id, filename: file.name, assistantId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  }

// list files in assistant's vector store
export async function GET() {
  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  const fileList = await openai.beta.vectorStores.files.list(vectorStoreId);

  const filesArray = await Promise.all(
    fileList.data.map(async (file) => {
      const fileDetails = await openai.files.retrieve(file.id);
      const vectorFileDetails = await openai.beta.vectorStores.files.retrieve(
        vectorStoreId,
        file.id
      );
      return {
        file_id: file.id,
        filename: fileDetails.filename,
        status: vectorFileDetails.status,
      };
    })
  );
  
  return Response.json(filesArray);
}

// delete file from assistant's vector store
export async function DELETE(request) {
  const body = await request.json();
  const fileId = body.fileId;

  const vectorStoreId = await getOrCreateVectorStore(); // get or create vector store
  await openai.beta.vectorStores.files.del(vectorStoreId, fileId); // delete file from vector store
  await openai.files.del(fileId); // delete file
  return new Response();
}

/* Helper functions */

const getOrCreateVectorStore = async () => {
  const assistant = await openai.beta.assistants.retrieve(assistantId);

  // if the assistant already has a vector store, return it
  if (assistant.tool_resources?.file_search?.vector_store_ids?.length > 0) {
    return assistant.tool_resources.file_search.vector_store_ids[0];
  }
  // otherwise, create a new vector store and attatch it to the assistant
  const vectorStore = await openai.beta.vectorStores.create({
    name: "sample-assistant-vector-store",
  });
  await openai.beta.assistants.update(assistantId, {
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    },
  });
  return vectorStore.id;
};
