import {
  calculateProposalTotal,
  validateProposal,
  DEFAULT_PROPOSAL,
} from "./logic";

export function runTests(): boolean {
  // Test 1: Total calculation
  const total = calculateProposalTotal([
    { id: "1", item: "A", description: "", qty: 2, rate: 500 },
    { id: "2", item: "B", description: "", qty: 1, rate: 1200 },
  ]);
  if (total !== 2200) {
    throw new Error(`Expected proposal total 2200, got ${total}`);
  }

  // Test 2: Validation of DEFAULT_PROPOSAL
  const val = validateProposal(DEFAULT_PROPOSAL);
  if (!val.valid) {
    throw new Error(`Default proposal failed validation: ${val.errors.join(", ")}`);
  }

  // Test 3: Validation error handling
  const badVal = validateProposal({ proposalTitle: "" });
  if (badVal.valid) {
    throw new Error("Expected validation error on empty proposal");
  }

  return true;
}
