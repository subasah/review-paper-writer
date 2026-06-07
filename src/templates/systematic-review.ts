export const SYSTEMATIC_REVIEW_TEMPLATE = {
  wordLimit: { min: 2500, max: 6500 },
  titleRequirement: 'Must include "Systematic Review" or "Meta-Analysis" in the title',
  abstract: {
    wordLimit: { min: 150, max: 250 },
    sections: ['Background', 'Objective', 'Material & Methods', 'Results', 'Conclusions', 'Keywords (3-6 MeSH terms)'],
  },
  articleStructure: [
    'Introduction',
    'Materials and Methods',
    'Results',
    'Discussion',
    'Conclusions',
    'Ethics Approval',
    'Acknowledgment',
    'Funding',
    'Conflicts of Interest',
    'Author Contribution',
  ],
  references: { min: 15, max: 100, style: 'Vancouver' },
  figures: { max: 8, minDpi: 300, formats: ['JPEG', 'PNG', 'TIFF'] },
  tables: { max: 8, editable: true },
  sections: {
    abstract: `Write a structured abstract (150-250 words) with:
- Background: Context and rationale
- Objective: Clear statement of aim
- Material & Methods: Databases searched, inclusion criteria, studies included
- Results: Key findings with numbers
- Conclusions: Main conclusions and implications
- Keywords: 3-6 MeSH terms`,

    introduction: `Write the Introduction covering:
- Background and context of the topic
- Rationale for the review
- Current state of knowledge
- Research gap this review addresses
- Aim and objectives
- Research questions`,

    methods: `Write Materials and Methods covering:
- Protocol registration (if applicable)
- Eligibility criteria (inclusion/exclusion)
- Information sources and databases searched
- Search strategy with Boolean query
- Study selection process (PRISMA)
- Data extraction process
- Quality appraisal method and tool
- Synthesis approach
- PRISMA reporting`,

    results: `Write Results covering:
- PRISMA flow summary with numbers
- Study characteristics table summary
- Quality appraisal summary
- Main findings organised by theme or outcome
- Use specific numbers from extraction data`,

    discussion: `Write Discussion covering:
- Summary of main findings
- Comparison with existing literature
- Strengths of the evidence base
- Limitations of included studies and the review
- Implications for practice and policy
- Directions for future research`,

    conclusions: `Write Conclusions covering:
- Clear answer to the research question
- Main contribution to knowledge
- Practical recommendations
- Brief statement on evidence quality`,
  },
}
