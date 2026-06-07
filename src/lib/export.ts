import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import type { ReviewProject } from '@/types/project'

function manuscriptToMarkdown(project: ReviewProject): string {
  const m = project.manuscript
  const sections = [
    ['Structured Abstract', m.abstract.content],
    ['Introduction', m.introduction.content],
    ['Materials and Methods', m.methods.content],
    ['Results', m.results.content],
    ['Discussion', m.discussion.content],
    ['Conclusions', m.conclusions.content],
    ['Ethics Approval', m.ethics.content],
    ['Acknowledgments', m.acknowledgments.content],
    ['Funding', m.funding.content],
    ['Conflicts of Interest', m.conflictsOfInterest.content],
    ['Author Contribution', m.authorContribution.content],
  ]

  let md = `# ${project.title}\n\n`
  for (const [title, content] of sections) {
    if (content) {
      md += `## ${title}\n\n${content}\n\n`
    }
  }

  if (m.references.length > 0) {
    md += `## References\n\n`
    m.references.forEach((ref, i) => {
      md += `${i + 1}. ${ref}\n`
    })
  }

  return md
}

export function exportMarkdown(project: ReviewProject) {
  const md = manuscriptToMarkdown(project)
  const blob = new Blob([md], { type: 'text/markdown' })
  const link = document.createElement('a')
  link.download = `${project.title.slice(0, 50).replace(/[^a-z0-9]/gi, '-')}.md`
  link.href = URL.createObjectURL(blob)
  link.click()
}

export async function exportDocx(project: ReviewProject) {
  const m = project.manuscript
  const children: Paragraph[] = [
    new Paragraph({ text: project.title, heading: HeadingLevel.TITLE }),
  ]

  const addSection = (title: string, content: string) => {
    if (!content) return
    children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }))
    content.split('\n').forEach((line) => {
      if (line.trim()) children.push(new Paragraph({ children: [new TextRun(line)] }))
    })
  }

  addSection('Structured Abstract', m.abstract.content)
  addSection('Introduction', m.introduction.content)
  addSection('Materials and Methods', m.methods.content)
  addSection('Results', m.results.content)
  addSection('Discussion', m.discussion.content)
  addSection('Conclusions', m.conclusions.content)

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  const link = document.createElement('a')
  link.download = `${project.title.slice(0, 50).replace(/[^a-z0-9]/gi, '-')}.docx`
  link.href = URL.createObjectURL(blob)
  link.click()
}

export function formatVancouverReference(
  authors: string[],
  title: string,
  journal: string,
  year: number,
  doi?: string
): string {
  const authorStr = authors.length > 6
    ? `${authors.slice(0, 6).join(', ')}, et al.`
    : authors.join(', ')
  let ref = `${authorStr}. ${title}. ${journal}. ${year}`
  if (doi) ref += `. doi:${doi}`
  return ref
}
