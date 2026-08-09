import { ChatRequest, ChatResponse, UploadResponse, ResumeRequest } from "@/types";

// Falls back to localhost for local dev if the env var isn't set, but the
// var should be defined in .env.local for real usage — see .env.local.example.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// FastAPI's default error body is `{ "detail": "..." }`. We try to surface
// that, but never let a bad/empty error body itself throw.
async function extractErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // response wasn't JSON — fall through to the generic message
  }
  return fallback;
}

/**
 * POST /chat — send a prompt (plus the selected tool route and thread id)
 * and get back the assistant's reply.
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Is the FastAPI backend running?",
      0
    );
  }

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      `Chat request failed (${response.status})`
    );
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<ChatResponse>;
}

/**
 * POST /upload — FastAPI expects `multipart/form-data` (it reads the file
 * via `UploadFile`, not a Pydantic JSON body), so this builds a FormData
 * object with a single `file` field rather than JSON-encoding anything.
 * On success (HTTP 201) the backend returns:
 *   { "message": string, "filename": string, "path": string }
 */
export async function uploadPDF(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      // Deliberately no Content-Type header — the browser sets the
      // multipart boundary itself. Setting it manually breaks the upload.
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Is the FastAPI backend running?",
      0
    );
  }

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      `Upload failed (${response.status})`
    );
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<UploadResponse>;
}

export async function resumeChat(
  threadId: string,
  feedback: string
): Promise<ChatResponse> {
  const request: ResumeRequest = { thread_id: threadId, feedback };
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Is the FastAPI backend running?",
      0
    );
  }

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      `Resume request failed (${response.status})`
    );
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<ChatResponse>;
}
