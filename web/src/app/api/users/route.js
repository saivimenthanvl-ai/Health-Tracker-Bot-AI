import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      return Response.json(users[0] || null);
    }
    
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, age, gender, blood_type, allergies, chronic_conditions, emergency_contact } = body;
    
    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }
    
    const users = await sql`
      INSERT INTO users (name, email, age, gender, blood_type, allergies, chronic_conditions, emergency_contact)
      VALUES (${name}, ${email}, ${age}, ${gender}, ${blood_type}, ${allergies}, ${chronic_conditions}, ${emergency_contact})
      RETURNING *
    `;
    
    return Response.json(users[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}