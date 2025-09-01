import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');
    
    let query = 'SELECT * FROM medications WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (userId) {
      paramCount++;
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }
    
    if (isActive !== null && isActive !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(isActive === 'true');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const medications = await sql(query, params);
    return Response.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    return Response.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, medication_name, dosage, frequency, start_date, end_date, prescribed_by, notes } = body;
    
    if (!user_id || !medication_name) {
      return Response.json({ error: 'User ID and medication name are required' }, { status: 400 });
    }
    
    const medications = await sql`
      INSERT INTO medications (user_id, medication_name, dosage, frequency, start_date, end_date, prescribed_by, notes)
      VALUES (${user_id}, ${medication_name}, ${dosage}, ${frequency}, ${start_date}, ${end_date}, ${prescribed_by}, ${notes})
      RETURNING *
    `;
    
    return Response.json(medications[0]);
  } catch (error) {
    console.error('Error creating medication:', error);
    return Response.json({ error: 'Failed to create medication' }, { status: 500 });
  }
}