---
name: topic-generation
description: Generate strong research topic ideas for systematic reviews. Use when the user needs original, feasible topic suggestions for a thesis, dissertation, or journal article.
---

# Topic Generation

Act as a senior academic supervisor in [FIELD].

I am a [LEVEL: undergraduate/master's/PhD] student interested in [BROAD AREA]. My academic background is [BRIEF BACKGROUND], and my preferred research context is [COUNTRY/REGION/POPULATION/INSTITUTION].

Generate [NUMBER] strong research topic ideas that are original, feasible and suitable for [THESIS/DISSERTATION/JOURNAL ARTICLE].

For each topic, provide:
1. A polished academic title
2. The main research problem
3. Why the topic matters
4. Possible research questions
5. Key variables or concepts
6. Suggested methodology
7. Possible data sources
8. Feasibility level
9. Potential contribution to knowledge
10. Possible limitations

Avoid generic topics. Make each topic specific, researchable and academically defensible.

## App Integration

Call `POST /api/gemini/generate` with `jsonMode: true`. Module: `src/prompts/index.ts` → `topic-generation`.
