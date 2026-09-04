import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin, getAdminResponseHeaders } from "@/src/lib/admin-auth";
import { deleteEnquiry, markEnquiryRead } from "@/src/lib/data-service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { read } = body;
    const updated = await markEnquiryRead(Number(id), read !== undefined ? !!read : true);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404, headers });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update enquiry" }, { status: 500, headers });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getAdminResponseHeaders();
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const { id } = await params;
    const deleted = await deleteEnquiry(Number(id));
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404, headers });
    }
    return NextResponse.json({ success: true, message: "Enquiry deleted" }, { status: 200, headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete enquiry" }, { status: 500, headers });
  }
}
