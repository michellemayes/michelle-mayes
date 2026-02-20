---
title: 'How I Replaced the Product Management Function with AI'
description: 'Architecture, failures, and lessons from building a RAG-powered AI agent that writes stronger specs and PRDs.'
pubDate: 'Feb 20 2026'
tags: ['AI', 'Product Management', 'RAG', 'Engineering']
---

*The architecture, failures, and hard-won lessons from building a RAG-powered AI agent that writes better specs & PRDs than humans.*

---

I eliminated the product management bottleneck at my company. Not by hiring, but by building. The system has refined 19 specifications, handled 264 sessions, and saved roughly 400 engineering hours—in its first month.

This post isn't about what AI could theoretically do. It's about what I shipped, what broke, and what I learned building it over the last 2 months.

And the kicker? I built all of this myself (all design decisions, features, etc.) with Claude Code. I am a data scientist and product manager, NOT a software engineer.

## The System I Built

There are two key interconnected components and you must start with the knowledge base to replicate this project:

1. **A multi-source RAG knowledge base** with hybrid search across seven data sources
2. **An AI agent** that uses that knowledge to run structured product refinement conversations and serves as an “all knowing” helper agent for the entire company

## Building the Knowledge Layer

### Source Extraction Architecture

I index seven sources: documentation wikis, team chat (public channels that contain product discussions), CRM records, help centers, support tickets, project management issues, and BI dashboards. Each source has its own extractor handling authentication, pagination, rate limiting, and schema normalization.

The critical insight: **extract in parallel, embed in batches**.

I use AWS Step Functions to orchestrate extraction. Each source runs as an independent branch—Confluence extraction doesn't wait for Slack extraction. One source failing doesn't block the others. This matters when you're hitting seven different APIs with different reliability characteristics.

Each extractor outputs to S3 as an intermediate cache. The embedding function pulls from S3, not directly from extractors. This decoupling saved me during debugging—I could replay embedding on cached documents without re-extracting.

### The Content Hashing Optimization

Embedding APIs charge per token. On a corpus of 50,000 documents where 5% change daily, you're paying for 50,000 embeddings when you only need 2,500.

My solution: SHA256 hash every document before embedding. Store the hash alongside the vector. On subsequent syncs, compute the hash and skip any document whose hash matches what's already in the database.

This reduced my embedding costs by 85% on typical days. The implementation is trivial but the ROI is not.

### Chunking Strategy

I use 1,000 character chunks with 200 character overlap. These numbers aren't magic—I tested ranges from 500-2000 characters and found 1,000 hit the sweet spot for my content mix (technical docs + conversational chat + structured tickets).

The overlap matters more than most people realize. Without it, you lose context at chunk boundaries. A sentence split across chunks becomes unfindable. 200 characters captures most sentence-spanning content without excessive duplication.

### Why Hybrid Search Beats Pure Vector

Pure vector search fails on acronyms, product names, and technical terms. Someone searches "SSO integration" but the docs say "single sign-on." Vector similarity misses.

Pure keyword search fails on semantic queries. Someone asks "how do we handle user authentication" and the answer is in a document titled "Login Flow Architecture." Keywords miss.

I run both in parallel and combine with Reciprocal Rank Fusion (RRF):

```
score = 1/(k + vector_rank) + 1/(k + fts_rank)
```

The k=60 constant comes from the original RRF paper. I tested values from 20-100; 60 consistently performed best on my evaluation set. Don't cargo-cult this number—test on your own data.

The database uses pgvector with IVFFlat indexing (100 lists) for vectors and a GIN index on a generated tsvector column for full-text. IVFFlat is slower than HNSW for queries but faster for inserts. With twice-daily bulk syncs, insert performance matters. I get sub-500ms p95 query latency, which is fast enough.

### Slack Conversation Grouping

Slack presented a unique problem: messages aren't documents. A single message like "yes" or "+1" is meaningless without context. But indexing entire channels creates massive chunks with diluted relevance.

I built a conversation grouper that clusters sequential messages based on three signals:

1. **Time proximity**: Messages within 20 minutes of each other
2. **Semantic similarity**: Embedding cosine similarity above 0.6 threshold
3. **Conversation boundaries**: Detection of conclusion signals ("thanks", "LGTM", resolved emoji reactions)

The grouper caps conversations at 40 messages to prevent runaway clustering. Each grouped conversation gets summarized via Claude Haiku before indexing—the summary becomes searchable content while the full conversation is stored as metadata.

### OCR for Visual Content

Documentation contains screenshots. Help articles contain annotated images. Support tickets contain error screenshots.

I integrated AWS Textract for OCR extraction. When the extractor encounters an image, it runs Textract and merges the extracted text into the document. This made a surprising amount of institutional knowledge searchable—architecture diagrams, whiteboard photos, annotated screenshots that previously existed only as pixels.

## Building the Agent Layer

### The Core Agent Loop

The agent uses Claude Opus via AWS Bedrock. I chose Bedrock over the direct API for VPC isolation—my database is in a private subnet, and I didn't want to hairpin through the public internet.

The loop is standard tool-use: send messages, check if the model wants to use a tool, execute tools, send results back, repeat. I cap at 15 iterations to prevent runaway loops.

The non-obvious part is loop detection. Without it, the agent can get stuck in cycles—searching for something, not finding it, searching slightly differently, not finding it, repeat. I track recent tool calls and break if the agent makes semantically identical calls three times in a row.

### Prompt Caching for Cost Control

The system prompt is ~5,000 tokens. It includes the agent's persona, tool descriptions, output format specifications, and conversation guidelines. Sending this on every API call adds up.

Bedrock supports ephemeral prompt caching with a 5-minute TTL. When a conversation has multiple back-and-forth exchanges (which most do), subsequent calls hit the cache. In production, I see ~90% cache hit rate on the system prompt.

At Opus pricing, that's the difference between $0.075 per turn and $0.0075 per turn. This moved the system from "too expensive to use freely" to "use it for everything."

### Session State Management

Conversations span days. Someone starts refining a spec on Monday, waits for stakeholder input Tuesday, finishes Wednesday. The agent needs to maintain context across these gaps.

I use DynamoDB for session storage with optimistic locking via a version field. If two Lambda invocations try to update the same session simultaneously, the second one fails and retries with fresh state. This prevents race conditions when webhooks arrive in rapid succession.

TTLs differ by mode: 24 hours for helper mode (quick Q&A), 7 days for refinement mode (full spec creation). DynamoDB auto-deletes expired sessions.

### Conversation Compaction

Long conversations hit context limits. A spec refinement with extensive back-and-forth can easily exceed 100,000 tokens.

At 350KB of conversation history, I trigger compaction. The logic: keep system messages, the last 10 exchanges, and any messages containing tool results. Summarize everything else.

The key insight: tool results contain factual information (search results, code snippets). Summarizing those loses fidelity. Summarizing discussion ("User clarified they want X, not Y") preserves intent while compressing tokens.

### Type-Specific Refinement Flows

Generic "act like a PM" prompting produces generic specs. I built explicit state machines for each ticket type.

**Bug Flow** asks three questions: reproduction steps and impact, root cause hypothesis and fix approaches, then verification criteria and rollback plans.

**Feature Flow** asks four: problem statement and success metrics, user flow and edge cases, scope boundaries and dependencies, then MVP analysis and potential scope cuts.

**Tech Debt Flow** asks three: current pain points and affected systems, proposed solution and breaking changes, then migration path and feature flag strategy.

Each question includes context the agent gathered from the knowledge base. The agent doesn't ask generic questions—it asks informed questions that demonstrate it's done homework. "I found 3 similar tickets from last quarter—here's how they were scoped" or "The docs mention this system has a 99.9% SLA requirement."

### The Tool Suite

The agent has 30 tools. The interesting architectural decisions:

**Knowledge base search** returns top 10 results with relevance scores. The agent tracks which results it uses and cites them as footnotes in generated specs. This serves dual purposes: transparency for engineers and knowledge gap detection for me.

**Similar ticket search** returns matches with confidence levels based on system overlap, active status, and scope similarity. High confidence matches trigger warnings—if someone's already working on the same thing, we shouldn't duplicate effort.

**Wait state management** handles the reality that product work involves waiting. When the user says "let me check with Sarah," the agent records who we're waiting for, what context we need, and when to follow up. A separate scheduled function monitors these and posts nudges when timeouts expire.

**Spec updates** are incremental, not full rewrites. The agent specifies which section to update, and the system handles versioning (v1.0 → v1.1 → v1.2). The original request is always preserved in a collapsible section for reference.

### Multimodal Input Handling

Tickets often include screenshots, mockups, or PDF attachments. I handle these natively:

**Images** get base64 encoded and passed directly to Claude as image content blocks (5MB limit, 8192px max dimension).

**PDFs** use Bedrock's native document blocks (up to 4.5MB). No preprocessing needed—Claude sees the rendered pages.

This matters more than I expected. Engineers paste screenshots constantly—error messages, UI mockups, architecture diagrams. The agent analyzing these directly removes the friction of manual transcription.

## Event Processing Architecture

### Webhook Handling

Events arrive from multiple platforms with different auth, payload formats, and retry behavior. The architecture:

```
Platform Webhook → API Gateway → Validation → SQS FIFO → Worker
```

Validation does three things: signature verification (HMAC-SHA256), bot event filtering (prevent loops), and deduplication key extraction for FIFO ordering.

SQS FIFO ensures events for the same ticket process in order. If a user posts comment A then comment B, we can't process B before A or context breaks. The message group ID is the ticket ID.

### Two-Layer Idempotency

Webhooks retry. The same event can arrive multiple times.

**Layer 1**: SQS FIFO deduplication with a 5-minute window. Same event ID within 5 minutes gets dropped.

**Layer 2**: Worker-level idempotency with a 24-hour window via DynamoDB conditional writes. Before processing, attempt to write the event ID with a condition that it doesn't exist. If it exists, skip.

This catches both rapid retries (SQS) and delayed retries (worker).

### Dual Authentication Pattern

Reading from the project management system requires different auth than writing. I use API key for reads (simpler, faster) and OAuth for writes (proper bot identity, audit trail).

Comments show as coming from "PAM" rather than a generic API user. This matters for audit trails and user trust—people know they're talking to a bot.

## Data Query Authorization

Engineers need data to scope work. "How many users hit this error?" or "What's the p99 latency?"

I integrated data warehouse queries with a hard constraint: **no unsupervised execution**.

The flow: agent proposes query with explanation → query validated against guardrails (1GB scan limit, 30-day time bound, allowed tables only) → posted to conversation with approve/reject buttons → human reviews → only executes after explicit approval → results returned inline or as file link.

The approval buttons are platform-native interactive components. Clicking triggers a webhook that marks the query as approved and continues the agent loop.

This pattern—AI proposes, human approves, AI executes—is generalizable to any capability where you want AI assistance with human oversight.

## What Actually Mattered

After building this, here's what I'd tell past me:

**Chunk overlap is load-bearing.** I initially set overlap to 0 thinking it was wasteful duplication. Queries that should have matched started failing. Relevant sentences were being split at chunk boundaries. 200 characters of overlap fixed it. Test your retrieval before assuming your chunking is fine.

**Hybrid search isn't optional.** I started with pure vector search because it's the "modern" approach. It failed on product names, acronyms, and technical terms—exactly what engineers search for most. Adding keyword search with RRF fusion improved retrieval quality more than any embedding model change.

**Session state is harder than the agent.** The agent loop is maybe 100 lines of logic. Session management—persistence, compaction, wait states, expiration, concurrency control—is 500+ lines and where most bugs lived. Invest here early.

**Type-specific flows beat prompt engineering.** I spent weeks trying to craft the perfect "act like a PM" prompt. Then I built explicit state machines with type-specific questions and immediately got better specs. The constraint of "ask these specific questions in this order" produces more useful output than "be a good PM."

**Prompt caching changes the cost equation.** Without caching, my 5K token system prompt costs $0.075 per turn. With caching at 90% hit rate, it's $0.0075. That's the difference between a side project budget and an "ask for approval" budget.

**Multimodal isn't a nice-to-have.** I added image/PDF support as an afterthought. It became one of the most-used capabilities. Engineers paste screenshots constantly. The agent understanding these directly removed a huge friction point I hadn't anticipated.

## The Numbers

After production deployment:

- **264 sessions** across two platforms
- **19 specs** completed through full refinement
- **~400 hours** of engineering time saved (based on pre/post comparison of clarification cycles)
- **833 tool invocations** (knowledge searches, code lookups, similar ticket finds)
- **Sub-500ms** p95 query latency on the RAG system
- **~90%** prompt cache hit rate
- **85%** reduction in embedding costs via content hashing

The specs are measurably better than what we got from the manual process. More consistent structure, edge cases always addressed, dependencies always listed, success criteria always measurable.

---

Building this took about 2 weeks from concept to production with Claude Code and deployed on AWS Serverless. The RAG layer was 3 days (with most of that fighting data extraction edge cases). The first version of the agent layer was 1 week (mostly fighting session state).

The product management function isn't disappearing. But the bottleneck of having humans do information retrieval, initial triage, data analysis, and structured questioning? That absolutely can be automated.

If you're building something similar, *start with the knowledge layer*. Get retrieval working well before touching the agent. Bad retrieval makes smart agents useless. Good retrieval makes simple agents unstoppable.

---

*I build AI systems that scale. Reach out if you're working on similar problems.*
