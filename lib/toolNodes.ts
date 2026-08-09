import { ToolNode } from "@/types";

// Backend AI nodes surfaced in the Tools pop-up. `route` is the exact
// literal the FastAPI ChatRequest.route_to_take field expects — kept as
// data, not markup, so the menu (and its wiring) never drifts apart.
export const TOOL_NODES: ToolNode[] = [
  {
    id: "web-search",
    label: "Web Search",
    description: "Pull live results from the open web",
    icon: "web",
    route: "web_search",
  },
  {
    id: "deep-research",
    label: "Deep Research",
    description: "Multi-step research across sources",
    icon: "research",
    route: "deep_research",
  },
  {
    id: "image-gen",
    label: "Image Gen",
    description: "Generate original images from a prompt",
    icon: "image",
    route: "image_gen",
  },
  {
    id: "writer",
    label: "Writer",
    description: "Draft and refine long-form writing",
    icon: "writer",
    route: "writer",
  },
  {
      id: "rag-search",
      label: "Upload",
      description: "Add a document to your knowledge base",
      icon: "rag",
      route: "rag_search",
      triggersUpload: true,
    },
];
