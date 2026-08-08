export type IconKey =
  | "web"
  | "research"
  | "image"
  | "writer"
  | "rag"
  | "upload";

// Mirrors the Literal[...] on the FastAPI ChatRequest.route_to_take field.
export type ChatRoute =
  | "web_search"
  | "deep_research"
  | "image_gen"
  | "writer"
  | "rag_search"
  | "normal_chat";

export interface ToolNode {
  id: string;
  label: string;
  description: string;
  icon: IconKey;
  route: ChatRoute;
  /** When true, selecting this node should also open the file picker
   *  (same trigger the "Upload" quick-action card uses) rather than
   *  only updating the selected-tool label. */
  triggersUpload?: boolean;
}

export interface ActionCardData {
  id: string;
  title: string;
  icon: IconKey;
}

/* ------------------------------------------------------------------ */
/* Backend contract — kept in exact 1:1 correspondence with the        */
/* Pydantic schemas in FastAPI. If those change, update only here.     */
/* ------------------------------------------------------------------ */

// class ChatRequest(BaseModel):
//     prompt: str
//     route_to_take: Literal[...]
//     thread_id: str
export interface ChatRequest {
  prompt: string;
  route_to_take: ChatRoute;
  thread_id: string;
}

// class ChatResponse(BaseModel):
//     response: str
//     route_taken: Optional[str]
//     img_url: Optional[str]
export interface ChatResponse {
  response: string;
  route_taken: string | null;
  img_url: string | null;
  is_awaiting_review?: boolean;
  node?: string | null;
}
export interface ResumeRequest {
  thread_id: string;
  /** "approved", or the human's free-text feedback — same convention as your CLI's interrupt() prompt. */
  feedback: string;
}

// POST /upload — not a Pydantic JSON body (FastAPI's UploadFile expects
// multipart/form-data), but the JSON response on success (HTTP 201) is:
// { "message": str, "filename": str, "path": str }
export interface UploadResponse {
  message: string;
  filename: string;
  path: string;
}

/* ------------------------------------------------------------------ */
/* Frontend-only chat state (not part of the API contract)             */
/* ------------------------------------------------------------------ */

export type ChatRole = "user" | "assistant";

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  imgUrl?: string;
  route?: string;
  isError?: boolean;
  /** True when this message is a paused LangGraph draft awaiting human approval/feedback. */
  isAwaitingReview?: boolean;
  /** True once the user has approved or submitted feedback for this review — locks the action area. */
  reviewResolved?: boolean;
}