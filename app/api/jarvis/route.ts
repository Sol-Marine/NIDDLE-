import { NextResponse } from "next/server";
import { getPendingOrders, getAvailableRiders, computeAssignments, executeAssignment } from "@/app/lib/jarvis";

export async function POST() {
  try {
    const [orders, riders] = await Promise.all([
      getPendingOrders(),
      getAvailableRiders(),
    ]);

    if (orders.length === 0) {
      return NextResponse.json({ message: "No pending orders", assignments: [] });
    }

    if (riders.length === 0) {
      return NextResponse.json({ message: "No available riders", assignments: [], unassigned: orders.length });
    }

    const assignments = computeAssignments(orders, riders);

    const results = await Promise.all(
      assignments.map(async (a) => {
        const success = await executeAssignment(a);
        return { ...a, success };
      })
    );

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
      message: `${successful.length} orders assigned, ${failed.length} failed`,
      assignments: successful,
      failed: failed.length,
      totalPending: orders.length,
      totalRiders: riders.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Assignment engine error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [orders, riders] = await Promise.all([
      getPendingOrders(),
      getAvailableRiders(),
    ]);

    const assignments = computeAssignments(orders, riders);

    return NextResponse.json({
      pendingOrders: orders.length,
      availableRiders: riders.length,
      suggestedAssignments: assignments,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
