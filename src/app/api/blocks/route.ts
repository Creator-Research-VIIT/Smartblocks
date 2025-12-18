/**
 * Blocks collection CRUD
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBlocks,
  getBlocksCount,
  createBlock,
  searchBlocks,
} from '@/lib/blocks-prisma';
import { createBlockSchema, queryParamsSchema } from '@/lib/validations';
import { ApiResponse, BlocksResponse } from '@/lib/types';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';

/* ---------------------------------- */
/* CORS                                */
/* ---------------------------------- */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/* ---------------------------------- */
/* Prisma → API mapper                 */
/* ---------------------------------- */
function mapBlock(block: any) {
  return {
    id: block.id,
    title: block.title,
    description: block.description,
    url: block.url,
    color: block.color,
    category: block.category,
    created_at: block.createdAt,
    updated_at: block.updatedAt,
  };
}

/* ---------------------------------- */
/* GET /api/blocks                     */
/* ---------------------------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = queryParamsSchema.safeParse({
      category: searchParams.get('category') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!params.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_FAILED,
          message: params.error.errors[0]?.message,
        },
        { status: HTTP_STATUS.BAD_REQUEST, headers: corsHeaders }
      );
    }

    const { category, limit = 50, offset = 0, search } = params.data;

    let blocks;
    let total: number;

    if (search) {
      blocks = await searchBlocks(search, limit, offset);
      total = await getBlocksCount(category, search);
    } else {
      blocks = await getBlocks(category, limit, offset);
      total = await getBlocksCount(category);
    }

    return NextResponse.json<ApiResponse<BlocksResponse>>(
      {
        success: true,
        data: {
          blocks: blocks.map(mapBlock),
          total,
          limit,
          offset,
          hasMore: offset + blocks.length < total,
        },
        message: SUCCESS_MESSAGES.BLOCKS_FETCHED,
      },
      { headers: corsHeaders }
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch blocks',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, headers: corsHeaders }
    );
  }
}

/* ---------------------------------- */
/* POST /api/blocks                    */
/* ---------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createBlockSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: ERROR_MESSAGES.VALIDATION_FAILED,
          message: validated.error.errors[0]?.message,
        },
        { status: HTTP_STATUS.BAD_REQUEST, headers: corsHeaders }
      );
    }

    // ✅ FIX: convert undefined → null for Prisma
    const block = await createBlock({
      ...validated.data,
      description: validated.data.description ?? null,
    });

    return NextResponse.json<ApiResponse<any>>(
      {
        success: true,
        data: mapBlock(block),
        message: SUCCESS_MESSAGES.BLOCK_CREATED,
      },
      { status: HTTP_STATUS.CREATED, headers: corsHeaders }
    );
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: ERROR_MESSAGES.DUPLICATE_URL,
          message: 'Block URL already exists',
        },
        { status: HTTP_STATUS.CONFLICT, headers: corsHeaders }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        message: 'Failed to create block',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR, headers: corsHeaders }
    );
  }
}

/* ---------------------------------- */
/* OPTIONS                             */
/* ---------------------------------- */
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
