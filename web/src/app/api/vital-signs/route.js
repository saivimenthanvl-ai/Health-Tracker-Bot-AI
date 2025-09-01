import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit') || '50';
    
    let query = 'SELECT * FROM vital_signs WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }
    
    paramCount++;
    query += ` ORDER BY recorded_at DESC LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    
    const vitalSigns = await sql(query, params);
    return Response.json(vitalSigns);
  } catch (error) {
    console.error('Error fetching vital signs:', error);
    return Response.json({ error: 'Failed to fetch vital signs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      user_id, 
      blood_pressure_systolic, 
      blood_pressure_diastolic, 
      heart_rate, 
      temperature, 
      weight, 
      height, 
      blood_sugar 
    } = body;
    
    if (!user_id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const vitalSigns = await sql`
      INSERT INTO vital_signs (
        user_id, blood_pressure_systolic, blood_pressure_diastolic, 
        heart_rate, temperature, weight, height, blood_sugar
      )
      VALUES (${user_id}, ${blood_pressure_systolic}, ${blood_pressure_diastolic}, 
              ${heart_rate}, ${temperature}, ${weight}, ${height}, ${blood_sugar})
      RETURNING *
    `;
    
    return Response.json(vitalSigns[0]);
  } catch (error) {
    console.error('Error creating vital signs:', error);
    return Response.json({ error: 'Failed to create vital signs' }, { status: 500 });
  }
}