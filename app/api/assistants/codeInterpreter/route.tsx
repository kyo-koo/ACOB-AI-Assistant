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
    return JSON.parse(data);
};
const writeData = (data: FileEntry[]) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
};
// upload file to assistant's vector store
export async function POST(request) {
  const formData = await request.formData(); // process file as FormData
  const file = formData.get("file") as File; // retrieve the single file from FormData
  
  // upload using the file stream
  const openaiFile = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  const fileExtension = openaiFile.filename.split('.').pop().toLowerCase();
    if (fileExtension === 'csv' || fileExtension === 'xlsx') {
      // Run the first set of code
      
      // Store file metadata
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
      const files = readData();
      files.push({ fileId: openaiFile.id, filename: file.name, assistantId });
      writeData(files);
      const fileList = readData() || []; // Ensure it's always an array
    const filteredFiles = fileList.filter(
      (file) => file?.filename && (file.filename.endsWith(".csv") || file.filename.endsWith(".xlsx"))
  );
  const fileIds: string[] = filteredFiles.map((file) => file.fileId);

    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        code_interpreter: {
          file_ids: fileIds,
        },
      },
    });
    } else {
      alert("Only CSV or XLSX files are allowed.")

    }
  
  return new Response(JSON.stringify({ success: true, fileId: openaiFile.id, filename: file.name, assistantId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    });
  }
// list files in assistant's file storage
export async function GET() {

    const fileList = readData() || []; // Ensure it's always an array
    const filteredFiles = fileList.filter(
      (file) => file?.filename && (file.filename.endsWith(".csv") || file.filename.endsWith(".xlsx"))
  );

    const filesArray = await Promise.all(
      filteredFiles.map(async (file) => {
        const fileDetails = await openai.files.retrieve(file.fileId);
        return {
          file_id: fileDetails.id,
          filename: fileDetails.filename,
        };
      })
    );

  
    return new Response(JSON.stringify(filesArray), {
      headers: { "Content-Type": "application/json" },
    });
}
// delete file from assistant's vector store
export async function DELETE(request) {
  const body = await request.json();
  const fileId = body.fileId;
   // Delete file from OpenAI
 //  await openai.files.del(fileId); // delete file
  let files = readData();
  files = files.filter(file => file.fileId !== fileId);
  writeData(files);


  const fileList = readData() || []; // Ensure it's always an array
    const filteredFiles = fileList.filter(
      (file) => file?.filename && (file.filename.endsWith(".csv") || file.filename.endsWith(".xlsx"))
  );
  const fileIds: string[] = filteredFiles.map((file) => file.fileId);

    await openai.beta.assistants.update(assistantId, {
      tool_resources: {
        code_interpreter: {
          file_ids: fileIds,
        },
      },
    });
    await openai.files.del(fileId); // delete file
  return new Response(JSON.stringify({ success: true, fileId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}