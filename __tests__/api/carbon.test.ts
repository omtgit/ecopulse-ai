import { POST } from "@/app/api/carbon/route";
import { getAuthenticatedUserId } from "@/lib/auth";

jest.mock("@/lib/auth");

describe("Carbon API Route", () => {
  it("rejects unauthorized requests", async () => {
    (getAuthenticatedUserId as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    const req = new Request("http://localhost/api/carbon", {
      method: "POST",
      body: JSON.stringify({ entries: [] })
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
