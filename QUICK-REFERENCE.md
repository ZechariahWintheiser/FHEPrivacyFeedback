# Quick Reference: Security & Performance Toolchain

## Toolchain Overview

```
ESLint + Solhint = Security & Gas Optimization
    ↓
Gas Reporter = Performance Monitoring
    ↓
DoS Protection = Bounded Operations
    ↓
Prettier = Code Consistency & Readability
    ↓
TypeScript = Type Safety
    ↓
Compiler Optimizer = Runtime Gas Savings
    ↓
Pre-commit Hooks = Shift-Left Security
    ↓
CI/CD Automation = Continuous Quality
```

## Quick Commands

### Essential Commands
```bash
npm install                          # Setup project
npm run compile                      # Compile contracts
npm test                             # Run tests
npm run lint                         # Check code quality
npm run format                       # Format code
```

### Security Commands
```bash
bash scripts/security-audit.sh       # Full security audit
npm run security:check               # Quick security check
npm run test:coverage                # Coverage report
```

### Performance Commands
```bash
bash scripts/performance-test.sh     # Full performance analysis
npm run gas:report                   # Gas consumption report
npm run size                         # Contract size check
```

### CI/CD Commands
```bash
npm run ci                           # Full CI pipeline
npm run prepare                      # Setup Git hooks
```

## Security Checklist

Before deployment:
- [ ] Run `bash scripts/security-audit.sh`
- [ ] Check `npm audit` for vulnerabilities
- [ ] Review gas costs with `npm run gas:report`
- [ ] Verify contract size with `npm run size`
- [ ] Ensure test coverage >80%
- [ ] Review Slither warnings
- [ ] Test DoS scenarios
- [ ] Verify privacy protection

## Performance Metrics

### Gas Optimization Targets
- submitFeedback: < 200,000 gas
- performConfidentialAnalysis: < 500,000 gas
- Contract deployment: < 3,000,000 gas

### Code Quality Metrics
- Test coverage: >80%
- Contract size: <24KB
- Linting: 0 errors
- Type errors: 0

## Common Issues

### Contract Too Large
```bash
npm run size                         # Check current size
# Solutions:
# - Enable optimizer (done)
# - Split into libraries
# - Remove dead code
```

### High Gas Costs
```bash
npm run gas:report                   # Analyze gas usage
# Solutions:
# - Batch operations
# - Cache storage reads
# - Optimize loops
```

### Security Warnings
```bash
bash scripts/security-audit.sh       # Full audit
# Review and fix:
# - Access control issues
# - Reentrancy risks
# - DoS vulnerabilities
```

## Tool Integration Map

| Stage | Tool | Purpose | Command |
|-------|------|---------|---------|
| Development | ESLint | JS/TS quality | `npm run lint:js` |
| Development | Solhint | Solidity security | `npm run lint:sol` |
| Development | Prettier | Formatting | `npm run format` |
| Compilation | Hardhat | Build contracts | `npm run compile` |
| Testing | Mocha | Unit tests | `npm test` |
| Testing | Gas Reporter | Gas analysis | `npm run gas:report` |
| Testing | Coverage | Coverage report | `npm run test:coverage` |
| Security | NPM Audit | Dependency scan | `npm audit` |
| Security | Slither | Static analysis | `npm run security:slither` |
| Security | Manual | Pattern check | `bash scripts/security-audit.sh` |
| Quality | TypeScript | Type checking | `npm run typecheck` |
| Quality | Contract Sizer | Size check | `npm run size` |
| Git | Husky | Pre-commit | Auto on commit |
| CI/CD | GitHub Actions | Automation | Auto on push |

## File Reference

| File | Purpose |
|------|---------|
| `.eslintrc.json` | ESLint configuration |
| `.solhint.json` | Solhint rules |
| `.prettierrc.json` | Prettier settings |
| `tsconfig.json` | TypeScript config |
| `hardhat.config.js` | Hardhat + gas reporter + optimizer |
| `.husky/pre-commit` | Pre-commit hooks |
| `.github/workflows/security-performance-ci.yml` | CI/CD pipeline |
| `SECURITY-PERFORMANCE.md` | Complete guide |

## Architecture Layers

```
┌───────────────────────────────────────┐
│   Code Quality (ESLint, Prettier)     │
├───────────────────────────────────────┤
│   Security (Solhint, Slither, Audit)  │
├───────────────────────────────────────┤
│   Optimization (Gas Reporter, Sizer)  │
├───────────────────────────────────────┤
│   Type Safety (TypeScript)            │
├───────────────────────────────────────┤
│   Automation (Husky, GitHub Actions)  │
└───────────────────────────────────────┘
```

## Best Practices

### Development Workflow
1. Write code
2. Run `npm run lint` (auto-fixes available)
3. Run `npm run format`
4. Run `npm test`
5. Commit (hooks run automatically)

### Pre-deployment Workflow
1. Run `bash scripts/security-audit.sh`
2. Run `bash scripts/performance-test.sh`
3. Review all reports
4. Fix any issues
5. Re-run audits
6. Deploy

### Continuous Improvement
1. Monitor gas costs over time
2. Track security metrics
3. Maintain test coverage
4. Update dependencies regularly
5. Review CI/CD results

## Support

For detailed information, see:
- **SECURITY-PERFORMANCE.md** - Complete guide
- **README.md** - Project overview
- **package.json** - All scripts
