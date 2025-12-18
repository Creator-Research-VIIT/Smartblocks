// src/app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getContactById, updateContact, deleteContact } from '@/lib/contacts-prisma';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// Simple ID validation
function validateId(idParam: string) {
  const id = parseInt(idParam, 10);
  if (!Number.isFinite(id) || id <= 0) return { ok: false as const };
  return { ok: true as const, id };
}

// Dummy auth check (replace with real auth logic)
function checkAuth() {
  // e.g., read session cookie
  const session = true; // temporary for testing
  return session ? { user: 'admin' } : null;
}

/** GET /api/contacts/[id] */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = checkAuth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

  const v = validateId(params.id);
  if (!v.ok) return NextResponse.json({ success: false, message: 'Invalid contact ID' }, { status: 400, headers: corsHeaders });

  const contact = await getContactById(v.id);
  if (!contact) return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404, headers: corsHeaders });

  return NextResponse.json({ success: true, contact }, { headers: corsHeaders });
}

/** PUT /api/contacts/[id] */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = checkAuth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

  const v = validateId(params.id);
  if (!v.ok) return NextResponse.json({ success: false, message: 'Invalid contact ID' }, { status: 400, headers: corsHeaders });

  try {
    const body = await request.json();
    const updated = await updateContact(v.id, body);

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Update failed or contact not found' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, contact: updated }, { headers: corsHeaders });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || 'Failed to update contact' }, { status: 500, headers: corsHeaders });
  }
}

/** DELETE /api/contacts/[id] */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = checkAuth();
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401, headers: corsHeaders });

  const v = validateId(params.id);
  if (!v.ok) return NextResponse.json({ success: false, message: 'Invalid contact ID' }, { status: 400, headers: corsHeaders });

  const deleted = await deleteContact(v.id);
  if (!deleted) return NextResponse.json({ success: false, message: 'Delete failed or contact not found' }, { status: 404, headers: corsHeaders });

  return NextResponse.json({ success: true, message: 'Contact deleted successfully' }, { headers: corsHeaders });
}
