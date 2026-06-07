export interface PromptModule {
  id: string
  name: string
  description: string
  fields: Array<{ key: string; label: string; type: 'text' | 'textarea' | 'select'; options?: string[]; placeholder?: string }>
  buildPrompt: (values: Record<string, string>) => string
}

export const PROMPT_MODULES: PromptModule[] = [
  {
    id: 'topic-generation',
    name: 'Topic Generation',
    description: 'Generate strong research topic ideas',
    fields: [
      { key: 'field', label: 'Field', type: 'text', placeholder: 'e.g. Psychology' },
      { key: 'level', label: 'Level', type: 'select', options: ['undergraduate', "master's", 'PhD'] },
      { key: 'broadArea', label: 'Broad Area', type: 'text', placeholder: 'e.g. Mental health interventions' },
      { key: 'background', label: 'Academic Background', type: 'textarea', placeholder: 'Brief background' },
      { key: 'context', label: 'Research Context', type: 'text', placeholder: 'Country/region/population' },
      { key: 'number', label: 'Number of Topics', type: 'text', placeholder: '5' },
      { key: 'outputType', label: 'Output Type', type: 'select', options: ['thesis', 'dissertation', 'journal article'] },
    ],
    buildPrompt: (v) => `Act as a senior academic supervisor in ${v.field}.

I am a ${v.level} student interested in ${v.broadArea}. My academic background is ${v.background}, and my preferred research context is ${v.context}.

Generate ${v.number || '5'} strong research topic ideas that are original, feasible and suitable for ${v.outputType || 'thesis/dissertation'}.

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

Return as structured JSON array with fields: title, researchProblem, whyItMatters, researchQuestions, keyVariables, methodology, dataSources, feasibility, contribution, limitations.`,
  },
  {
    id: 'topic-refinement',
    name: 'Topic Refinement',
    description: 'Refine a broad topic into a researchable focus',
    fields: [
      { key: 'topic', label: 'Current Topic', type: 'textarea' },
      { key: 'field', label: 'Field', type: 'text' },
      { key: 'level', label: 'Level', type: 'select', options: ['undergraduate', "master's", 'PhD'] },
      { key: 'context', label: 'Study Context', type: 'text' },
      { key: 'methodology', label: 'Likely Methodology', type: 'select', options: ['qualitative', 'quantitative', 'mixed methods', 'not sure'] },
    ],
    buildPrompt: (v) => `Act as an experienced thesis supervisor and research design expert.

Here is my current research topic: "${v.topic}"

My field is ${v.field}. My academic level is ${v.level}. My study context is ${v.context}. My likely methodology is ${v.methodology}.

Refine this topic into a stronger, narrower and more researchable academic topic.

Please:
1. Identify what is too broad, vague or weak
2. Suggest 5 improved versions
3. Explain the difference between each version
4. Recommend the strongest version
5. Explain why it is strongest
6. Suggest a suitable aim, objectives and research questions
7. Identify possible methodological challenges
8. Suggest how to make the topic more original and feasible

Do not overcomplicate the topic beyond what is realistic for my level and resources.`,
  },
  {
    id: 'gap-identification',
    name: 'Gap Identification',
    description: 'Identify research gaps from key studies',
    fields: [
      { key: 'researchArea', label: 'Research Area', type: 'textarea' },
      { key: 'study1', label: 'Study 1', type: 'textarea', placeholder: 'Author, Year — finding/method/context' },
      { key: 'study2', label: 'Study 2', type: 'textarea' },
      { key: 'study3', label: 'Study 3', type: 'textarea' },
      { key: 'study4', label: 'Study 4', type: 'textarea' },
      { key: 'study5', label: 'Study 5', type: 'textarea' },
    ],
    buildPrompt: (v) => `Act as a senior literature review expert and journal reviewer.

I am working on this research area: ${v.researchArea}

Here are the key studies I have read:
1. ${v.study1}
2. ${v.study2}
3. ${v.study3}
4. ${v.study4}
5. ${v.study5}

Analyse these studies and identify realistic research gaps.

Consider gaps based on: population, context, methodology, theory, variables or concepts, data source, contradictory findings, practical application.

For each possible gap, provide:
1. Type of gap
2. Evidence from the studies
3. Why the gap matters
4. Possible research question
5. Possible topic/title
6. Whether the gap is strong, moderate or weak
7. How I can justify it in a thesis or article

Do not invent a gap. If the gap is weak, say so clearly.`,
  },
  {
    id: 'lit-review-structure',
    name: 'Literature Review Structure',
    description: 'Design a literature review chapter structure',
    fields: [
      { key: 'topic', label: 'Research Topic', type: 'textarea' },
      { key: 'aim', label: 'Research Aim', type: 'textarea' },
      { key: 'questions', label: 'Research Questions', type: 'textarea' },
      { key: 'field', label: 'Field', type: 'text' },
      { key: 'level', label: 'Level', type: 'select', options: ['undergraduate', "master's", 'PhD'] },
      { key: 'structure', label: 'Preferred Structure', type: 'select', options: ['thematic', 'chronological', 'methodological', 'theoretical', 'mixed'] },
    ],
    buildPrompt: (v) => `Act as a thesis supervisor and academic writing coach.

My research topic is: "${v.topic}"
My research aim is: ${v.aim}
My research questions are: ${v.questions}
My field is ${v.field}. My level is ${v.level}. I prefer a ${v.structure} literature review structure.

Design a strong literature review structure for this study.

Include:
1. Major sections and subsections
2. What each section should discuss
3. How each section connects to the research problem
4. Where to discuss theories or models
5. Where to discuss empirical studies
6. Where to compare and contrast findings
7. Where to identify gaps
8. How to move from broad background to the specific gap
9. A logical flow from introduction to conclusion

Make the structure analytical, critical and suitable for serious academic work.`,
  },
  {
    id: 'critical-lit-analysis',
    name: 'Critical Literature Analysis',
    description: 'Critically evaluate a literature review section',
    fields: [
      { key: 'text', label: 'Literature Review Text', type: 'textarea' },
    ],
    buildPrompt: (v) => `Act as a strict but helpful PhD supervisor.

Below is a section of my literature review: ${v.text}

Evaluate it critically.

Check whether the section:
1. Summarises studies or actually analyses them
2. Compares and contrasts findings
3. Shows relationships between studies
4. Identifies disagreements, limitations or gaps
5. Connects the literature to my research problem
6. Uses strong academic logic
7. Avoids unsupported claims
8. Has clear paragraph flow
9. Sounds human, scholarly and not AI-generated

Then provide:
- diagnostic critique
- specific weaknesses
- suggested improvements
- revised version in strong academic UK English
- brief explanation of what changed and why

Do not invent citations or claims. Preserve my meaning but improve clarity, flow and critical depth.`,
  },
  {
    id: 'aim-objectives-rqs',
    name: 'Aim, Objectives & RQs',
    description: 'Improve aim, objectives and research questions',
    fields: [
      { key: 'topic', label: 'Research Topic', type: 'textarea' },
      { key: 'problem', label: 'Research Problem', type: 'textarea' },
      { key: 'aim', label: 'Current Aim', type: 'textarea' },
      { key: 'objectives', label: 'Current Objectives', type: 'textarea' },
      { key: 'questions', label: 'Current Research Questions', type: 'textarea' },
    ],
    buildPrompt: (v) => `Act as an expert thesis supervisor.

My research topic is: "${v.topic}"
My research problem is: ${v.problem}
My current aim, objectives and research questions are:

Aim: ${v.aim}
Objectives: ${v.objectives}
Research questions: ${v.questions}

Improve them for clarity, alignment and academic quality.

Please:
1. Check whether the aim is focused and realistic
2. Check whether the objectives are measurable
3. Remove vague verbs where necessary
4. Use strong academic verbs
5. Ensure each objective can be answered through data
6. Improve the research questions
7. Show the alignment between aim, objectives, questions and methodology

Present the final version in a clean table.`,
  },
  {
    id: 'methodology-selection',
    name: 'Methodology Selection',
    description: 'Recommend the most suitable research methodology',
    fields: [
      { key: 'topic', label: 'Research Topic', type: 'textarea' },
      { key: 'aim', label: 'Aim', type: 'textarea' },
      { key: 'questions', label: 'Research Questions', type: 'textarea' },
      { key: 'field', label: 'Field', type: 'text' },
      { key: 'context', label: 'Context', type: 'text' },
      { key: 'resources', label: 'Available Resources', type: 'textarea' },
      { key: 'level', label: 'Research Level', type: 'select', options: ['undergraduate', "master's", 'PhD'] },
    ],
    buildPrompt: (v) => `Act as a senior research methodology adviser.

My research topic is: "${v.topic}"
My aim is: ${v.aim}
My research questions are: ${v.questions}
My field is ${v.field}. My context is ${v.context}. My available resources are ${v.resources}. My research level is ${v.level}.

Recommend the most suitable methodology.

Compare:
1. Qualitative approach
2. Quantitative approach
3. Mixed methods approach

For each option, explain: suitability, possible data sources, sampling strategy, data collection methods, data analysis methods, strengths, weaknesses, ethical issues, feasibility.

Then recommend the best option and justify it clearly.

Do not recommend a method because it sounds impressive. Recommend what is realistic and defensible.`,
  },
  {
    id: 'methodology-chapter',
    name: 'Methodology Chapter Structure',
    description: 'Create a detailed methodology chapter outline',
    fields: [
      { key: 'title', label: 'Study Title', type: 'text' },
      { key: 'aim', label: 'Research Aim', type: 'textarea' },
      { key: 'questions', label: 'Research Questions', type: 'textarea' },
      { key: 'methodology', label: 'Methodology', type: 'select', options: ['qualitative', 'quantitative', 'mixed methods'] },
      { key: 'collection', label: 'Data Collection', type: 'text' },
      { key: 'analysis', label: 'Data Analysis', type: 'text' },
    ],
    buildPrompt: (v) => `Act as an experienced thesis examiner and methodology supervisor.

My study is titled: "${v.title}"
Research aim: ${v.aim}
Research questions: ${v.questions}
Methodology: ${v.methodology}
Data collection method: ${v.collection}
Data analysis method: ${v.analysis}

Create a detailed methodology chapter structure.

Include: Introduction, Research philosophy or paradigm, Research design, Study area or context, Population and sample, Sampling strategy, Data collection method, Research instrument, Validity/reliability/trustworthiness, Data analysis procedure, Ethical considerations, Limitations of the methodology, Chapter summary.

For each section, explain exactly what I should write and what examiners expect to see.

Use UK academic style and avoid unnecessary jargon.`,
  },
  {
    id: 'data-analysis-plan',
    name: 'Data Analysis Plan',
    description: 'Design a detailed data analysis plan',
    fields: [
      { key: 'title', label: 'Study Title', type: 'text' },
      { key: 'questions', label: 'Research Questions', type: 'textarea' },
      { key: 'dataType', label: 'Type of Data', type: 'select', options: ['qualitative interviews', 'survey data', 'experimental data', 'secondary data', 'text data', 'mixed data'] },
      { key: 'sampleSize', label: 'Sample Size', type: 'text' },
      { key: 'variables', label: 'Variables or Themes', type: 'textarea' },
      { key: 'software', label: 'Software Available', type: 'text' },
    ],
    buildPrompt: (v) => `Act as a data analysis adviser for academic research.

My study is titled: "${v.title}"
Research questions: ${v.questions}
Type of data: ${v.dataType}
Sample size: ${v.sampleSize}
Variables or themes: ${v.variables}
Software available: ${v.software}

Design a detailed data analysis plan.

For each research question, provide:
1. Type of analysis required
2. Variables or data needed
3. Statistical test or qualitative analysis method
4. Why that method is appropriate
5. Assumptions to check
6. How to present the results
7. Possible tables or figures
8. Common mistakes to avoid

If my proposed analysis is not suitable, correct it and explain why.`,
  },
  {
    id: 'discussion-chapter',
    name: 'Discussion Chapter',
    description: 'Develop a strong discussion chapter',
    fields: [
      { key: 'title', label: 'Study Title', type: 'text' },
      { key: 'questions', label: 'Research Questions', type: 'textarea' },
      { key: 'finding1', label: 'Finding 1', type: 'textarea' },
      { key: 'finding2', label: 'Finding 2', type: 'textarea' },
      { key: 'finding3', label: 'Finding 3', type: 'textarea' },
      { key: 'lit1', label: 'Literature 1', type: 'text' },
      { key: 'lit2', label: 'Literature 2', type: 'text' },
      { key: 'lit3', label: 'Literature 3', type: 'text' },
      { key: 'theory', label: 'Theory or Framework', type: 'text' },
    ],
    buildPrompt: (v) => `Act as a thesis examiner and journal reviewer.

My study is titled: "${v.title}"
Research questions: ${v.questions}
Key findings: 1. ${v.finding1} 2. ${v.finding2} 3. ${v.finding3}
Relevant literature: 1. ${v.lit1} 2. ${v.lit2} 3. ${v.lit3}
Theory or framework: ${v.theory}

Help me develop a strong discussion chapter.

For each finding:
1. Interpret what the finding means
2. Explain how it answers the research question
3. Compare it with existing literature
4. Explain whether it agrees, contradicts or extends previous studies
5. Connect it to theory or framework
6. Explain its practical, policy or scholarly implications
7. Identify limitations in interpretation
8. Suggest what future research should examine

Avoid simply repeating the results. Make the discussion analytical, critical and contribution-focused.`,
  },
  {
    id: 'thesis-to-journal',
    name: 'Thesis to Journal Article',
    description: 'Convert thesis chapter into publishable article',
    fields: [
      { key: 'thesisTitle', label: 'Thesis Title', type: 'text' },
      { key: 'chapter', label: 'Relevant Chapter', type: 'text' },
      { key: 'findings', label: 'Main Findings', type: 'textarea' },
      { key: 'journal', label: 'Target Journal/Field', type: 'text' },
      { key: 'wordLimit', label: 'Word Limit', type: 'text' },
    ],
    buildPrompt: (v) => `Act as a senior journal editor and publication mentor.

I want to convert part of my thesis into a journal article.

Thesis title: ${v.thesisTitle}
Relevant chapter or section: ${v.chapter}
Main findings: ${v.findings}
Target journal or field: ${v.journal}
Word limit: ${v.wordLimit}

Help me identify the strongest publishable article from this thesis.

Please:
1. Identify the most publishable angle
2. Suggest a journal article title
3. Define the article's central argument
4. Suggest the best article structure
5. Explain what to remove from the thesis
6. Explain what to rewrite for journal style
7. Suggest how to sharpen the abstract
8. Suggest possible target journals or journal types
9. Identify possible reviewer concerns
10. Suggest how to position the contribution clearly

Do not treat the article as a shortened thesis. Help me create a focused publishable manuscript.`,
  },
  {
    id: 'quality-check',
    name: 'Final Academic Quality Check',
    description: 'Rigorous examiner-style review of academic work',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'level', label: 'Academic Level', type: 'select', options: ['undergraduate', "master's", 'PhD', 'journal article'] },
      { key: 'section', label: 'Section', type: 'text' },
      { key: 'aim', label: 'Research Aim', type: 'textarea' },
      { key: 'questions', label: 'Research Questions', type: 'textarea' },
      { key: 'content', label: 'Section Content', type: 'textarea' },
    ],
    buildPrompt: (v) => `Act as an external thesis examiner and journal reviewer.

Title: ${v.title}
Academic level: ${v.level}
Section: ${v.section}
Research aim: ${v.aim}
Research questions: ${v.questions}

Section content to review:
${v.content}

Please assess the section for:
1. Relevance to the title
2. Clarity of argument
3. Alignment with aim and research questions
4. Literature engagement
5. Methodological consistency
6. Critical analysis
7. Academic tone
8. Structure and coherence
9. Repetition
10. Unsupported claims
11. Ethical or integrity concerns
12. Examiner or reviewer concerns

Then provide:
- overall assessment
- strengths
- weaknesses
- high-priority revisions
- lower-priority improvements
- sentences that need evidence
- possible viva or reviewer questions
- revised version where necessary

Be rigorous. Do not flatter me unnecessarily. Do not invent citations, evidence or claims.`,
  },
]

export function getPromptModule(id: string): PromptModule | undefined {
  return PROMPT_MODULES.find((m) => m.id === id)
}
