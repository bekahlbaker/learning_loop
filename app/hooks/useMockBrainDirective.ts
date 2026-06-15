import { PERSONAS_BY_ID } from '@adaptive/shared'
import type { BrainDirective, PersonaId } from '@adaptive/shared'

// todo: create an API route proxy to the brain service to bypass CORS issues

export function useMockBrainDirective(personaId: PersonaId): BrainDirective {
  const persona = PERSONAS_BY_ID[personaId]
  const { coldStart } = persona

  return {
    directiveType: coldStart.firstDirective,
    teachingTone: coldStart.teachingTone,
    explanationDepth: coldStart.explanationDepth,
    targetLessonId: null,
    targetLevelId: null,
    recommendedNextLessonId: null,
    masteryScores: {},
    overallMastery: 0,
    flags: {
      suggestBreak: false,
      flaggedForReview: false,
      progressStalled: false,
      disengagementRisk: false,
    },
    rationale: `Cold-start directive for "${persona.label}" persona: ${persona.description}`,
    issuedAt: new Date().toISOString(),
  }
}
