import { simulateGetAction } from "@/actions/serverActions";

export async function marketDetails(
  marketAddress: string,
  caller: string
): Promise<string | number | bigint | object> {
  return await simulateGetAction(marketAddress, "market_details", caller);
}
