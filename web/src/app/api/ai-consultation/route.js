import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, symptoms, consultation_type = 'general' } = body;
    
    if (!user_id || !symptoms) {
      return Response.json({ error: 'User ID and symptoms are required' }, { status: 400 });
    }
    
    // Get user's medical history for context
    const [user, medications, vitalSigns, medicalRecords] = await sql.transaction([
      sql`SELECT * FROM users WHERE id = ${user_id}`,
      sql`SELECT * FROM medications WHERE user_id = ${user_id} AND is_active = true`,
      sql`SELECT * FROM vital_signs WHERE user_id = ${user_id} ORDER BY recorded_at DESC LIMIT 5`,
      sql`SELECT * FROM medical_records WHERE user_id = ${user_id} ORDER BY date_recorded DESC LIMIT 10`
    ]);
    
    if (!user[0]) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userInfo = user[0];
    
    // Prepare context for AI
    const medicalContext = {
      age: userInfo.age,
      gender: userInfo.gender,
      bloodType: userInfo.blood_type,
      allergies: userInfo.allergies,
      chronicConditions: userInfo.chronic_conditions,
      currentMedications: medications.map(m => `${m.medication_name} ${m.dosage} ${m.frequency}`),
      recentVitals: vitalSigns[0] || null,
      recentSymptoms: medicalRecords.filter(r => r.record_type === 'symptom').slice(0, 3)
    };
    
    // Create AI prompt based on consultation type
    let aiPrompt = '';
    if (consultation_type === 'medicine_suggestion') {
      aiPrompt = `As a medical AI assistant, provide medicine suggestions for the following symptoms: "${symptoms}".
      
Patient Context:
- Age: ${medicalContext.age}, Gender: ${medicalContext.gender}
- Blood Type: ${medicalContext.bloodType}
- Allergies: ${medicalContext.allergies || 'None reported'}
- Chronic Conditions: ${medicalContext.chronicConditions || 'None reported'}
- Current Medications: ${medicalContext.currentMedications.join(', ') || 'None'}

Please provide:
1. Possible over-the-counter medications
2. Important warnings and contraindications
3. When to seek immediate medical attention
4. General care recommendations

IMPORTANT: This is for informational purposes only and should not replace professional medical advice.`;
    } else if (consultation_type === 'doctor_advice') {
      aiPrompt = `As a medical AI assistant, provide doctor consultation advice for: "${symptoms}".
      
Patient Context:
- Age: ${medicalContext.age}, Gender: ${medicalContext.gender}
- Medical History: ${medicalContext.chronicConditions || 'None reported'}
- Current Medications: ${medicalContext.currentMedications.join(', ') || 'None'}
- Recent Vitals: ${medicalContext.recentVitals ? `BP: ${medicalContext.recentVitals.blood_pressure_systolic}/${medicalContext.recentVitals.blood_pressure_diastolic}, HR: ${medicalContext.recentVitals.heart_rate}` : 'None recorded'}

Please advise:
1. Urgency level (Low/Medium/High/Emergency)
2. Recommended specialist type if needed
3. Questions to ask the doctor
4. Preparation for the appointment
5. Red flag symptoms to watch for

IMPORTANT: This is guidance only. Seek immediate medical attention for emergencies.`;
    } else {
      aiPrompt = `As a medical AI assistant, provide general health advice for: "${symptoms}".
      
Patient Context:
- Age: ${medicalContext.age}, Gender: ${medicalContext.gender}
- Known Conditions: ${medicalContext.chronicConditions || 'None reported'}

Please provide general health guidance, lifestyle recommendations, and when to seek medical care.

IMPORTANT: This is for informational purposes only and should not replace professional medical advice.`;
    }
    
    // TODO: Replace with actual AI integration call
    // For now, return a placeholder response
    const aiResponse = `[AI Response Placeholder - Please select an AI integration to enable this feature]
    
Based on your symptoms: "${symptoms}"

This is where the AI would provide:
- Medical recommendations
- Safety warnings
- When to seek professional help
- Relevant health advice

Please select an AI integration (ChatGPT, Claude, or Gemini) to enable real AI-powered medical consultations.`;
    
    const confidenceScore = 0.85; // Placeholder confidence
    
    // Save consultation to database
    const consultation = await sql`
      INSERT INTO ai_consultations (user_id, symptoms, ai_response, confidence_score, consultation_type)
      VALUES (${user_id}, ${symptoms}, ${aiResponse}, ${confidenceScore}, ${consultation_type})
      RETURNING *
    `;
    
    return Response.json({
      consultation: consultation[0],
      medicalContext: medicalContext
    });
    
  } catch (error) {
    console.error('Error in AI consultation:', error);
    return Response.json({ error: 'Failed to process AI consultation' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') || '20';
    
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const consultations = await sql`
      SELECT * FROM ai_consultations 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT ${parseInt(limit)}
    `;
    
    return Response.json(consultations);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return Response.json({ error: 'Failed to fetch consultations' }, { status: 500 });
  }
}