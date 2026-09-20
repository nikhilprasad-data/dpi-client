# dpi_AI — Chat Interface

Dark-mode AI chat interface built with Next.js 14 (App Router) + TypeScript,
wired to a FastAPI backend. Strict Separation of Concerns: every component
is a `.tsx` file paired with its own `.module.css` file. Zero inline
styles anywhere in the project — verified below.

## Run it

```bash
npm install
cp .env.local.example .env.local   # point at your FastAPI backend if not localhost:8000
npm run dev
```

Open http://localhost:3000. Your FastAPI backend should be running at
the URL in `.env.local` (default `http://127.0.0.1:8000/api`) with
`/chat` and `/upload` endpoints.

## Folder structure

```
dpi-ai-chat/
├── app/
│   ├── layout.tsx        Root layout, loads Space Grotesk + Inter via next/font
│   ├── page.tsx           Owns chat state, sidebar state, upload handling;
│   │                      composes Sidebar / Header / Hero / SearchBar /
│   │                      ActionCards / ChatWindow
│   ├── page.module.css    App shell + sidebar/main-column layout, hidden
│   │                      file input class (SoC-safe alternative to
│   │                      style="display:none")
│   └── globals.css        Design tokens (colors, radius, spacing, shadow) + resets
│
├── components/
│   ├── Header/                    Branding + sidebar toggle
│   ├── Sidebar/                   Collapsible: New Chat, recent chats, profile
│   ├── Hero/                      Centered headline (empty state)
│   ├── SearchBar/                 Pill input, Tools popup, mic, send/loading
│   ├── ToolPopup/                 Dropdown listing the 5 backend AI nodes
│   ├── ActionCards/                Deep Research / Writer / Upload row
│   ├── ChatWindow/                Message list — Markdown rendering for
│   │                              assistant replies, plain text for user,
│   │                              img_url rendering, typing indicator
│   └── icons/Icons.tsx            All inline SVGs (no .module.css — see note below)
│
├── hooks/
│   ├── useChat.ts          Owns messages/isLoading/threadId; sendMessage,
│   │                      addMessage, resetChat ("New Chat")
│   └── useSpeechRecognition.ts   Web Speech API wrapper, feature-detected
│
├── lib/
│   ├── api.ts              The ONLY file that calls fetch — sendChatMessage,
│   │                      uploadPDF, typed ApiError
│   ├── toolNodes.ts        Data for the Tools pop-up (route_to_take mapping)
│   ├── actionCards.ts      Data for the 3 quick-action cards
│   └── recentChats.ts      Placeholder sidebar history (swap for a real
│                          endpoint once the backend exposes one)
│
├── types/index.ts           ChatRequest / ChatResponse / UploadResponse —
│                            1:1 mirrors of the FastAPI Pydantic schemas
│
├── package.json
├── tsconfig.json            "@/*" path alias → project root
└── next.config.js
```

## Architecture verification (final review)

- **Zero inline styles**: `grep -rn "style={{" --include="*.tsx" .` returns
  no matches, repo-wide. Every visual rule lives in a `.module.css` file.
- **1:1 component/stylesheet pairing**: every component folder has exactly
  one `.tsx` and one `.module.css`. The sole exception is `icons/Icons.tsx`
  — it's pure SVG markup with no styling of its own; color/size are applied
  by the *consumer* via `className`, same as any other prop.
- **State lifted correctly**: `app/page.tsx` is the only place `useChat()`
  is called. `SearchBar` and `ChatWindow` receive everything as props and
  hold no chat/message state themselves. `SearchBar` also occupies a single,
  stable position in the JSX across both the empty and conversation states,
  so it's never unmounted/remounted during the Hero → ChatWindow transition
  (only its wrapping div's class changes, via CSS).
- **API layer**: `lib/api.ts` is the only module that touches `fetch`.
  `sendChatMessage` posts JSON matching `ChatRequest` and returns
  `ChatResponse`. `uploadPDF` posts `multipart/form-data` with a single
  `file` field and returns `UploadResponse` (`message`/`filename`/`path`,
  matching your HTTP 201 contract exactly). Both throw a typed `ApiError`
  with FastAPI's `detail` message surfaced.

## What's new in this pass

- **Sidebar** (`components/Sidebar`): "New Chat" button (calls
  `resetChat()`), a placeholder recent-chats list (`lib/recentChats.ts` —
  swap for a real history endpoint later), and a profile footer.
  Collapsible via the panel icon in the Header or the sidebar's own
  collapse button. Pushes content on desktop; becomes an off-canvas drawer
  with a backdrop below 880px.
- **Markdown-ready assistant messages**: `ChatWindow` renders assistant
  replies through `react-markdown` + `remark-gfm` (headings, lists, code
  blocks, tables, links), styled entirely via the `.markdown` scope in
  `ChatWindow.module.css`. User messages stay plain text.
- **Upload wired up**: the "Upload" quick-action card now opens a (visually
  hidden, but accessible) file picker, calls `uploadPDF`, and reflects the
  result — success or failure — as a message in the chat via the new
  `addMessage` helper on `useChat`.
- **Header**: added a sidebar-toggle button; a bottom border gives it a
  persistent, premium separation from the content below.

## Design tokens (app/globals.css)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#0b0b0f` | page background |
| `--color-bg-elevated` | `#16161c` | search bar / cards / sidebar |
| `--color-accent` | `#ff3b3b` | brand red — logo, mic/send button, active states |
| `--font-display` | Space Grotesk | logo + hero headline + markdown headings |
| `--font-body` | Inter | everything else |
