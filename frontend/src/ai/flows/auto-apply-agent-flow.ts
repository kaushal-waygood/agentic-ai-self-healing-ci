'use server';

/**
 * @fileOverview The AI agent for automatically preparing job applications.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AutoApplySettings, mockUserProfile, SavedCv, SavedCoverLetter } from '@/lib/data/user';
import { searchJobsFlow } from './search-jobs-flow';
import { generateTailoredApplication } from './tailored-application';
import { mockApplications, MockApplication } from '@/lib/data/applications';
import { JobSearchFlowInputSchema } from '@/lib/schemas/job-search-schema';
import { getJobDetails } from './get-job-details-flow';

const AutoApplySettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  dailyLimit: z.number(),
  jobFilters: JobSearchFlowInputSchema.pick({
    query: true,
    country: true,
    datePosted: true,
    workFromHome: true,
    employmentTypes: true,
  }),
  baseCvId: z.string(),
  coverLetterSettings: z.object({
    strategy: z.enum(['generate', 'use_template']),
    templateId: z.string().optional(),
    instructions: z.string().optional(),
  }),
  lastRun: z.string().optional(),
});

const AutoApplyAgentInputSchema = z.object({
  agentId: z.string(),
  settings: AutoApplySettingsSchema,
});

const AutoApplyAgentOutputSchema = z.object({
  applicationsPrepared: z.number(),
  message: z.string(),
});

export async function triggerAutoApplyAgent(agentId: string, settings: AutoApplySettings) {
  // This is a "fire-and-forget" call from the client.
  // We don't return the result directly to the UI, as it runs in the background.
  autoApplyAgentFlow({ agentId, settings });
  return { success: true, message: "Agent triggered." };
}

const autoApplyAgentFlow = ai.defineFlow(
  {
    name: 'autoApplyAgentFlow',
    inputSchema: AutoApplyAgentInputSchema,
    outputSchema: AutoApplyAgentOutputSchema,
  },
  async ({ agentId, settings }) => {
    console.log(`[AutoApplyAgent] Starting flow for agent: ${agentId} (${settings.name})`);

    if (!settings.isActive) {
      console.log(`[AutoApplyAgent] Agent ${agentId} is not active. Aborting.`);
      return { applicationsPrepared: 0, message: "Agent is not active." };
    }

    // 1. Fetch base CV and Cover Letter template
    const baseCv = mockUserProfile.savedCvs.find(cv => cv.id === settings.baseCvId);
    if (!baseCv) {
      console.error(`[AutoApplyAgent] Base CV not found for agent ${agentId}. Aborting.`);
      throw new Error("Base CV not found.");
    }

    let coverLetterTemplate = "";
    if (settings.coverLetterSettings.strategy === 'use_template' && settings.coverLetterSettings.templateId) {
        const cl = mockUserProfile.savedCoverLetters.find(cl => cl.id === settings.coverLetterSettings.templateId);
        if (cl) coverLetterTemplate = cl.htmlContent;
    }

    // 2. Search for jobs based on agent's filters
    console.log(`[AutoApplyAgent] Searching for jobs with filters for agent ${agentId}:`, settings.jobFilters);
    const searchResults = await searchJobsFlow(settings.jobFilters);
    console.log(`[AutoApplyAgent] Agent ${agentId} found ${searchResults.length} potential jobs.`);

    // 3. Filter out jobs that have already been applied to or drafted
    const appliedJobIds = new Set(mockApplications.map(app => app.jobId));
    const newJobs = searchResults.filter(job => !appliedJobIds.has(job.id));
    console.log(`[AutoApplyAgent] Agent ${agentId} found ${newJobs.length} new jobs to process.`);

    // 4. Process jobs up to the daily limit
    const jobsToProcess = newJobs.slice(0, settings.dailyLimit);
    let applicationsPrepared = 0;

    for (const job of jobsToProcess) {
      console.log(`[AutoApplyAgent] Agent ${agentId} processing job: ${job.title} at ${job.company}`);

      // Immediately create a placeholder application for user feedback
      const placeholderId = `app-draft-${job.id}`;
      let applicationToUpdate = mockApplications.find(app => app.id === placeholderId);
      if (!applicationToUpdate) {
        const placeholderApplication: MockApplication = {
          id: placeholderId,
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          dateApplied: new Date().toISOString().split('T')[0],
          status: 'Draft',
        };
        mockApplications.unshift(placeholderApplication);
        applicationToUpdate = placeholderApplication;
      }
      
      try {
        // Fetch full job details to get a complete and formatted description
        const detailedJob = await getJobDetails({ jobId: job.id });
        if (!detailedJob) {
          throw new Error(`Could not retrieve full details for job ${job.id}.`);
        }

        let userCvContext = baseCv.htmlContent;
        if (coverLetterTemplate) {
            userCvContext += `\n\n--- COVER LETTER TEMPLATE/INSTRUCTIONS ---\n${coverLetterTemplate}`;
        }
        if (settings.coverLetterSettings.instructions) {
             userCvContext += `\n\n--- SPECIFIC INSTRUCTIONS FROM USER ---\n${settings.coverLetterSettings.instructions}`;
        }

        const tailoredDocs = await generateTailoredApplication({
          jobTitle: detailedJob.title,
          companyName: detailedJob.company,
          jobDescription: detailedJob.description,
          userCv: userCvContext,
          userName: mockUserProfile.fullName,
        });

        // Save the generated materials
        const newCvName = `AI-Drafted CV for ${detailedJob.title.substring(0, 20)}...`;
        const newCv: SavedCv = {
            id: `cv-${detailedJob.id}`, name: newCvName, htmlContent: tailoredDocs.tailoredCv,
            createdAt: new Date().toISOString(), jobTitle: detailedJob.title,
        };
        mockUserProfile.savedCvs.unshift(newCv);

        const newClName = `AI-Drafted CL for ${detailedJob.title.substring(0, 20)}...`;
        const newCl: SavedCoverLetter = {
            id: `cl-${detailedJob.id}`, name: newClName, htmlContent: tailoredDocs.coverLetter,
            createdAt: new Date().toISOString(), jobDescription: detailedJob.description,
            tone: 'Formal', style: 'Concise', 
        };
         mockUserProfile.savedCoverLetters.unshift(newCl);

        // Update the placeholder application with final data
        applicationToUpdate.status = 'AI-Drafted';
        applicationToUpdate.savedCvId = newCv.id;
        applicationToUpdate.savedCoverLetterId = newCl.id;
        applicationToUpdate.emailDraft = tailoredDocs.emailDraft;
        applicationToUpdate.id = `app-${detailedJob.id}`; // Give it a permanent ID
        
        applicationsPrepared++;
        console.log(`[AutoApplyAgent] Agent ${agentId} successfully prepared application for ${detailedJob.title}.`);

      } catch (error) {
        console.error(`[AutoApplyAgent] Agent ${agentId} failed to process job ${job.id}:`, error);
        // Mark the draft application as having an error
        if (applicationToUpdate) {
            applicationToUpdate.status = 'Error';
        }
      }
    }
    
    // Generate a user notification if any applications were prepared
    if (applicationsPrepared > 0) {
      mockUserProfile.actionItems.unshift({
        id: `action-agent-${agentId}-${Date.now()}`,
        applicationId: 'ai-auto-apply-page', // Special ID for routing
        summary: `Your agent "${settings.name}" prepared ${applicationsPrepared} new draft application(s).`,
        date: new Date().toISOString(),
        isRead: false,
      });
    }

    // Update last run time in user settings for the correct agent
    const agentToUpdate = mockUserProfile.autoApplyAgents.find(a => a.id === agentId);
    if(agentToUpdate) {
        agentToUpdate.lastRun = new Date().toISOString();
        console.log(`[AutoApplyAgent] Updated last run time for agent ${agentId}.`);
    }

    console.log(`[AutoApplyAgent] Flow for agent ${agentId} finished. Prepared ${applicationsPrepared} applications.`);
    return {
      applicationsPrepared,
      message: `Agent run complete. Prepared ${applicationsPrepared} new application(s).`,
    };
  }
);
