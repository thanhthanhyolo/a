import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisRequest {
  cv: string;
  jd: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { cv, jd }: AnalysisRequest = await req.json();

    if (!cv || !jd) {
      return new Response(
        JSON.stringify({ error: "Both cv and jd are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract common tech terms from both texts
    const techTerms = [
      "javascript", "typescript", "react", "angular", "vue", "node", "express",
      "python", "django", "flask", "java", "spring", "kotlin", "swift",
      "sql", "postgresql", "mongodb", "redis", "docker", "kubernetes",
      "aws", "azure", "gcp", "git", "ci/cd", "agile", "scrum",
      "rest", "api", "graphql", "html", "css", "tailwind",
      "figma", "photoshop", "machine learning", "data analysis",
      "project management", "communication", "leadership", "teamwork",
      "problem solving", "critical thinking", "time management",
    ];

    const cvLower = cv.toLowerCase();
    const jdLower = jd.toLowerCase();

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const skillMatch: Record<string, number> = {};

    for (const term of techTerms) {
      const inCv = cvLower.includes(term);
      const inJd = jdLower.includes(term);
      if (inJd) {
        skillMatch[term] = inCv ? 100 : 0;
        if (inCv) {
          matchedSkills.push(term);
        } else {
          missingSkills.push(term);
        }
      }
    }

    // Calculate match score
    const totalJdSkills = Object.keys(skillMatch).length;
    const matchScore = totalJdSkills > 0
      ? Math.round((matchedSkills.length / totalJdSkills) * 100)
      : 50;

    // Generate strengths
    const strengths = matchedSkills.map((s) =>
      `Strong match: ${s.charAt(0).toUpperCase() + s.slice(1)}`
    );
    if (strengths.length === 0) {
      strengths.push("Review your CV for keyword optimization");
    }

    // Generate gaps
    const gaps = missingSkills.map((s) =>
      `Missing: ${s.charAt(0).toUpperCase() + s.slice(1)}`
    );
    if (gaps.length === 0) {
      gaps.push("No significant skill gaps detected");
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (matchScore < 80) {
      suggestions.push("Add missing keywords from the job description to your CV");
    }
    if (matchScore < 60) {
      suggestions.push("Consider highlighting relevant project experience");
    }
    suggestions.push("Quantify your achievements with specific metrics and numbers");
    suggestions.push("Tailor your CV summary to match the job requirements");
    if (missingSkills.length > 3) {
      suggestions.push("Consider upskilling in the missing areas through courses or projects");
    }

    const result = {
      matchScore,
      strengths,
      gaps,
      suggestions,
      skillMatch,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
