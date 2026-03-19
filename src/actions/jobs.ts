"use server";

import { supabase } from '@/lib/supabase';

/**
 * SERVER ACTION: Fetch curated, verified jobs from Supabase.
 * Target Table: verified_jobs
 */
export async function getCuratedJobs(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('verified_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase Query Error:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Unexpected Error in getCuratedJobs:", err);
    return [];
  }
}
