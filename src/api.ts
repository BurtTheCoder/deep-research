import cors from 'cors';
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { deepResearch, writeFinalAnswer, writeFinalReport } from './deep-research';
import { createClient } from './db';

const app = express();
const port = process.env.PORT || 3051;

// Middleware
app.use(cors());
app.use(express.json());

const db = createClient();

// Helper function for consistent logging
function log(...args: any[]) {
  console.log(...args);
}

// API endpoint to start research
app.post('/api/research', async (req: Request, res: Response) => {
  try {
    const { query, depth = 3, breadth = 3, type = 'answer', format = 'standard' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    log('\nStarting research...\n');

    const { learnings, visitedUrls } = await deepResearch({
      query,
      breadth,
      depth,
    });

    if (type === 'report') {
      // Create report entry
      const reportId = uuidv4();
      await db.createReport({
        id: reportId,
        query,
        status: 'processing',
        createdAt: new Date().toISOString(),
      });

      // Start report generation in background
      writeFinalReport({
        prompt: query,
        learnings,
        visitedUrls,
        format,
      }).then(async (report) => {
        await db.updateReport(reportId, {
          content: report,
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
      }).catch(async (error) => {
        await db.updateReport(reportId, {
          status: 'failed',
          error: error.message,
        });
      });

      return res.json({
        success: true,
        reportId,
        message: 'Report generation started',
      });
    }

    // For quick answers, return immediately
    const answer = await writeFinalAnswer({
      prompt: query,
      learnings,
    });

    return res.json({
      success: true,
      answer,
      learnings,
      visitedUrls,
    });
  } catch (error: unknown) {
    console.error('Error in research API:', error);
    return res.status(500).json({
      error: 'An error occurred during research',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get all reports
app.get('/api/reports', async (_req: Request, res: Response) => {
  try {
    const reports = await db.getReports();
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch reports',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get single report
app.get('/api/reports/:id', async (req: Request, res: Response) => {
  try {
    const report = await db.getReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    return res.json(report);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch report',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(port, () => {
  console.log(`Deep Research API running on port ${port}`);
});

export default app;
