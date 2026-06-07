---
name: literature-search
description: Search academic databases and build Boolean queries for systematic reviews. Use when configuring database searches, deduplication, or year-range filtering.
---

# Literature Search

## Supported Databases

| Database | API | Key Required |
|----------|-----|--------------|
| PubMed | E-utilities | No |
| OpenAlex | REST API | No |
| Semantic Scholar | Graph API | Optional |
| Scopus | Elsevier API | Yes |
| Web of Science | Clarivate API | Yes |
| Google Scholar | Gemini search grounding | No (web-discovered) |

## Unified Search

`POST /api/search/unified`

```json
{
  "booleanQuery": "(\"CBT\" OR \"cognitive behavioral therapy\") AND anxiety",
  "databases": ["pubmed", "openalex", "semantic_scholar"],
  "yearFrom": 2015,
  "yearTo": 2025,
  "maxResults": 50
}
```

## Deduplication

DOI > PMID > title similarity (Fuse.js threshold 0.85).

## Search Radius

UI slider sets `yearFrom = currentYear - searchRadiusYears` (default 10, range 1-50).

## Implementation

- `api/search/pubmed.ts`
- `api/search/openalex.ts`
- `api/search/semantic-scholar.ts`
- `api/search/scopus.ts`
- `api/search/wos.ts`
- `api/search/unified.ts`
