"use server";

import { supabase } from '@/lib/supabase';

// TODO: Remove DUMMY_JOBS once verified_jobs table has sufficient data
const DUMMY_JOBS = [
  {
    id: "dummy-1",
    title: "Senior Frontend Engineer",
    company: "Stripe",
    matchScore: 94,
    reasoning: "Your React and TypeScript experience closely aligns with Stripe's frontend stack. Your past fintech work is a direct signal.",
    salary: "$180k – $220k",
    location: "San Francisco, CA (Hybrid)",
    techStack: ["React", "TypeScript", "GraphQL", "Next.js"],
    url: "https://stripe.com/jobs",
    created_at: new Date().toISOString(),
  },
  {
    id: "dummy-2",
    title: "Staff Software Engineer",
    company: "Vercel",
    matchScore: 91,
    reasoning: "Deep Next.js expertise is a core requirement here and your open-source contributions make you a standout candidate.",
    salary: "$200k – $240k",
    location: "Remote (US)",
    techStack: ["Next.js", "Rust", "Node.js", "AWS"],
    url: "https://vercel.com/careers",
    created_at: new Date().toISOString(),
  },
  {
    id: "dummy-3",
    title: "Full Stack Engineer",
    company: "Linear",
    matchScore: 88,
    reasoning: "Linear's stack mirrors your background. Your product design sensibility is a bonus for a tools-focused company.",
    salary: "$160k – $195k",
    location: "Remote (Worldwide)",
    techStack: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    url: "https://linear.app/careers",
    created_at: new Date().toISOString(),
  },
  {
    id: "dummy-4",
    title: "Frontend Engineer II",
    company: "Figma",
    matchScore: 85,
    reasoning: "Your UI component work and performance optimisation experience are directly relevant to Figma's rendering challenges.",
    salary: "$155k – $190k",
    location: "New York, NY (Hybrid)",
    techStack: ["React", "WebGL", "Canvas API", "TypeScript"],
    url: "https://figma.com/careers",
    created_at: new Date().toISOString(),
  },
  {
    id: "dummy-5",
    title: "Software Engineer, Growth",
    company: "Notion",
    matchScore: 82,
    reasoning: "Strong product instincts and React skills match Notion's growth team requirements for full-funnel experimentation.",
    salary: "$145k – $175k",
    location: "Remote (US)",
    techStack: ["React", "Python", "A/B Testing", "SQL"],
    url: "https://notion.so/careers",
    created_at: new Date().toISOString(),
  },
  {
    id: "dummy-6",
    title: "Senior React Native Engineer",
    company: "Airbnb",
    matchScore: 79,
    reasoning: "Your cross-platform experience is valuable here. Airbnb is rebuilding core guest flows in React Native.",
    salary: "$170k – $210k",
    location: "San Francisco, CA (Onsite)",
    techStack: ["React Native", "TypeScript", "GraphQL", "Ruby"],
    url: "https://airbnb.com/careers",
    created_at: new Date().toISOString(),
  },
];

/**
 * SERVER ACTION: Fetch curated, verified jobs from Supabase.
 * Target Table: verified_jobs
 * Falls back to DUMMY_JOBS when the table has fewer than 4 rows (for UI testing).
 */
export async function getCuratedJobs(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('verified_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase Query Error:", error);
      return DUMMY_JOBS.slice(0, limit);
    }

    // Fall back to dummy data if the table is too sparse to test the UI
    if (!data || data.length < 4) {
      return DUMMY_JOBS.slice(0, limit);
    }

    return data;
  } catch (err) {
    console.error("Unexpected Error in getCuratedJobs:", err);
    return DUMMY_JOBS.slice(0, limit);
  }
}
