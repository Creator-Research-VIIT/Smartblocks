import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getContactById, updateContact, deleteContact } from '@/lib/contacts-prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function checkAuth() {
  const session = cookies().get('admin_session');
  if (!session) return null;
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

function validateId(idParam: string) {
  const id = parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) return { ok: false as const };
  return { ok: true as const, id };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET /api/contacts/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = true;
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

  const v = validateId(params.id);
  if (!v.ok) return NextResponse.json({ success: false, message: 'Invalid contact id' }, { status: 400, headers: corsHeaders });

  const contact = await getContactById(v.id);
  if (!contact) return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404, headers: corsHeaders });
  return NextResponse.json({ success: true, contact }, { headers: corsHeaders });
}

// PUT /api/contacts/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = true;
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

  const v = validateId(params.id);
  if (!v.ok) return NextResponse.json({ success: false, message: 'Invalid contact id' }, { status: 400, headers: corsHeaders });

  try {
    const body = await request.json();
    const updated = await updateContact(v.id, body);
    if (!updated) return NextResponse.json({ success: false, message: 'Update failed or contact not found' }, { status: 404, headers: corsHeaders });
    return NextResponse.json({ success: true, contact: updated }, { headers: corsHeaders });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Failed to update contact' }, { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/contacts/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = true;
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

  const v = validateId(params.id);
  if (!v.ok) return NextResponse.json({ success: false, message: 'Invalid contact id' }, { status: 400, headers: corsHeaders });

  const deleted = await deleteContact(v.id);
  if (!deleted) return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 404, headers: corsHeaders });
  return NextResponse.json({ success: true }, { headers: corsHeaders });
}
