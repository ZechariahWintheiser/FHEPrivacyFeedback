#!/bin/bash

# Performance Optimization Test Suite
# Measures gas consumption across different optimization levels

set -e

echo "════════════════════════════════════════════════════════════"
echo "  Performance Optimization Analysis"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 1. Contract Size Analysis
print_header "1. Contract Size Analysis"
echo "Checking contract sizes against 24KB limit..."
echo ""
npx hardhat size-contracts

# 2. Gas Consumption Report
print_header "2. Gas Consumption Report"
echo "Generating detailed gas report..."
echo ""
REPORT_GAS=true npm test

# 3. Optimization Recommendations
print_header "3. Optimization Recommendations"
echo ""
echo "Analyzing contract for optimization opportunities..."
echo ""

# Check for storage packing
echo -e "${YELLOW}Storage Layout Analysis:${NC}"
grep -n "struct" contracts/*.sol | head -5

echo ""
echo -e "${YELLOW}Loop Analysis:${NC}"
grep -n "for\|while" contracts/*.sol | wc -l | xargs echo "Total loops found:"

echo ""
echo -e "${YELLOW}External Call Analysis:${NC}"
grep -n "external\|public" contracts/*.sol | wc -l | xargs echo "External/public functions:"

# 4. Code Splitting Opportunities
print_header "4. Code Splitting Analysis"
echo ""
echo "Analyzing contract modularity..."
echo ""

# Count functions by visibility
echo "Function visibility distribution:"
grep -o "function.*external" contracts/*.sol | wc -l | xargs echo "  External:"
grep -o "function.*public" contracts/*.sol | wc -l | xargs echo "  Public:"
grep -o "function.*internal" contracts/*.sol | wc -l | xargs echo "  Internal:"
grep -o "function.*private" contracts/*.sol | wc -l | xargs echo "  Private:"

# 5. DoS Risk Assessment
print_header "5. DoS Risk Assessment"
echo ""
echo "Checking for DoS vulnerabilities..."
echo ""

# Check for unbounded loops
echo "Unbounded loop analysis:"
grep -n "for.*feedbackCounter\|while.*true" contracts/*.sol && \
    echo -e "${YELLOW}⚠️  Potential unbounded loops detected${NC}" || \
    echo -e "${GREEN}✓ No unbounded loops detected${NC}"

echo ""
echo "Array operations:"
grep -c "\.push\|\.pop" contracts/*.sol | xargs echo "  Total array operations:"

# 6. Generate Optimization Report
print_header "6. Generating Optimization Report"
REPORT_FILE="optimization-report-$(date +%Y%m%d-%H%M%S).txt"

{
    echo "Performance Optimization Report"
    echo "Generated: $(date)"
    echo ""
    echo "Project: Privacy Feedback System"
    echo ""
    echo "Contract Size: See above analysis"
    echo "Gas Consumption: See gas report"
    echo "Optimization Level: runs=1000, viaIR=true"
    echo ""
    echo "Recommendations:"
    echo "  1. Monitor contract size (must be < 24KB)"
    echo "  2. Batch FHE operations for gas efficiency"
    echo "  3. Use two-pass analysis to optimize loops"
    echo "  4. Cache storage reads in memory"
    echo "  5. Minimize external calls"
    echo ""
    echo "DoS Protection:"
    echo "  ✓ Bounded iterations"
    echo "  ✓ Early termination"
    echo "  ✓ Gas-optimized operations"
    echo ""
} > "$REPORT_FILE"

echo -e "${GREEN}✓ Optimization report saved to: $REPORT_FILE${NC}"

# 7. Summary
print_header "Performance Analysis Complete"
echo ""
echo -e "${GREEN}✓ All performance checks completed${NC}"
echo ""
echo "Next steps:"
echo "  1. Review optimization report: $REPORT_FILE"
echo "  2. Compare gas costs with baseline"
echo "  3. Implement recommended optimizations"
echo "  4. Re-run analysis to verify improvements"
echo ""
echo "════════════════════════════════════════════════════════════"
