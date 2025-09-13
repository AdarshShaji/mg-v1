// supabase/functions/process-enrollment/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts' // Assuming you have a standard cors.ts file

// This is a placeholder for the real Gemini AI analysis.
// It simulates the AI's logic for now, making it fully testable.
// TODO: Replace this with a real call to the Gemini API in production.
async function getAiProfileSummary(assessmentData: any): Promise<any> {
  console.log("Simulating AI Profile Generation for:", assessmentData.child_name);
  
  const summary = {
    focus_areas: [],
    strengths: [],
    interests: assessmentData.assessment_data.interests || 'Not specified',
  };

  const concerns = assessmentData.assessment_data.concerns || [];
  if (concerns.includes('Speech Delay') || concerns.includes('Difficulty Understanding')) {
    summary.focus_areas.push({
      category: 'Language Skills',
      reason: 'Parent noted concerns about speech and comprehension.'
    });
  }
  if (concerns.includes('Difficulty Sharing') || concerns.includes('Shyness')) {
    summary.focus_areas.push({
      category: 'Social & Emotional Skills',
      reason: 'Parent noted challenges with peer interaction and sharing.'
    });
  }
  if (concerns.includes('Fine Motor Issues') || concerns.includes('Clumsiness')) {
    summary.focus_areas.push({
      category: 'Motor Skills',
      reason: 'Parent noted difficulties with fine motor tasks.'
    });
  }
  
  if (assessmentData.assessment_data.cognitive_skills === 'Above Average') {
    summary.strengths.push('Advanced problem-solving and cognitive abilities noted by parent.');
  }

  return summary;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { assessment_id } = await req.json();
    if (!assessment_id) throw new Error("Assessment ID is required.");

    // Create an admin client to securely perform database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch the raw assessment data
    const { data: assessmentData, error: fetchError } = await supabaseAdmin
      .from('student_assessments')
      .select('id, student_id, child_name, assessment_data')
      .eq('id', assessment_id)
      .single();
    if (fetchError) throw fetchError;

    // 2. Get the AI-generated profile summary
    const summary = await getAiProfileSummary(assessmentData);

    // 3. Find the best pathway recommendations based on the summary's focus areas
    const focusCategories = summary.focus_areas.map((fa: any) => fa.category);
    
    let recommendedPathways = [];
    if (focusCategories.length > 0) {
      const { data: pathways, error: pathwayError } = await supabaseAdmin
        .from('skill_pathways')
        .select('id, pathway_name, problem_category')
        .in('problem_category', focusCategories);
      if (pathwayError) throw pathwayError;
      recommendedPathways = pathways || [];
    }

    // 4. Call our database function to perform the transaction
    const { error: rpcError } = await supabaseAdmin.rpc('update_assessment_and_assign_pathways', {
        assessment_id_param: assessment_id,
        summary_param: summary,
        pathways_param: recommendedPathways.map(p => ({ student_id: assessmentData.student_id, pathway_id: p.id }))
    });
    if (rpcError) throw rpcError;

    // 5. Return the results to the frontend
    return new Response(JSON.stringify({ summary, recommendedPathways }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error in process-enrollment function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});