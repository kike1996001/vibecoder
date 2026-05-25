import { Router, Request, Response } from 'express';
import { verifyJWT } from './middleware.js';
import { supabaseClient } from './supabaseClient.ts';

const router = Router();

// GET /api/metrics/summary - Get user's dashboard metrics
router.get('/summary', verifyJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get credit ledger entries
    const { data: ledger, error: ledgerError } = await supabaseClient
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ledgerError) throw ledgerError;

    // Get user credits
    const { data: credits, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') throw creditsError;

    const currentBalance = credits?.balance || 0;

    // Calculate metrics
    const generations = ledger.filter(
      (entry: any) => entry.source === 'generation' && entry.amount < 0
    );

    const totalCreditsUsed = Math.abs(
      generations.reduce((sum: number, entry: any) => sum + entry.amount, 0)
    );

    const successfulGenerations = generations.length;

    // Group by template
    const byTemplate: Record<string, number> = {};
    generations.forEach((entry: any) => {
      const template = entry.metadata?.template || 'unknown';
      byTemplate[template] = (byTemplate[template] || 0) + 1;
    });

    // Generate timeline (last 30 days)
    const timeline: Array<{ date: string; count: number; credits: number }> = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayEntries = generations.filter(
        (entry: any) => entry.created_at.split('T')[0] === dateStr
      );

      if (dayEntries.length > 0) {
        timeline.push({
          date: dateStr,
          count: dayEntries.length,
          credits: Math.abs(
            dayEntries.reduce((sum: number, entry: any) => sum + entry.amount, 0)
          ),
        });
      }
    }

    // Calculate ROI (estimated value saved)
    // Average dev cost: $100/hour, assume each generated app saves 20 hours
    const estimatedValue = successfulGenerations * 100 * 20;

    res.json({
      success: true,
      data: {
        totalGenerations: successfulGenerations,
        totalCreditsUsed,
        creditsRemaining: currentBalance,
        byTemplate,
        timeline,
        estimatedValue,
        successRate: 100, // This could be enhanced with failed attempts tracking
        joinedDate: ledger[ledger.length - 1]?.created_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/metrics/timeline - Detailed timeline data for advanced charts
router.get('/timeline', verifyJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const days = parseInt(req.query.days as string) || 30;

    const { data: ledger, error } = await supabaseClient
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const generations = ledger.filter(
      (entry: any) => entry.source === 'generation' && entry.amount < 0
    );

    // Group by day
    const timelineMap: Record<
      string,
      { count: number; credits: number; templates: Record<string, number> }
    > = {};

    generations.forEach((entry: any) => {
      const date = entry.created_at.split('T')[0];
      if (!timelineMap[date]) {
        timelineMap[date] = { count: 0, credits: 0, templates: {} };
      }
      timelineMap[date].count += 1;
      timelineMap[date].credits += Math.abs(entry.amount);

      const template = entry.metadata?.template || 'unknown';
      timelineMap[date].templates[template] =
        (timelineMap[date].templates[template] || 0) + 1;
    });

    const timeline = Object.entries(timelineMap)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/metrics/providers - Usage breakdown by AI provider
router.get('/providers', verifyJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data: ledger, error } = await supabaseClient
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const generations = ledger.filter(
      (entry: any) => entry.source === 'generation' && entry.amount < 0
    );

    const byProvider: Record<string, { count: number; credits: number }> = {};

    generations.forEach((entry: any) => {
      const provider = entry.metadata?.provider || 'unknown';
      if (!byProvider[provider]) {
        byProvider[provider] = { count: 0, credits: 0 };
      }
      byProvider[provider].count += 1;
      byProvider[provider].credits += Math.abs(entry.amount);
    });

    res.json({
      success: true,
      data: byProvider,
    });
  } catch (error) {
    console.error('Error fetching provider metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch provider metrics',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
