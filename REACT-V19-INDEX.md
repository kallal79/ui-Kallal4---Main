# React v19 Upgrade Documentation Index

## Overview

This document serves as an index for all documentation related to the React v19 upgrade for Jaeger-UI.

## Documentation

### Main Documents

- [**REACT-V19-UPGRADE-SUMMARY.md**](./REACT-V19-UPGRADE-SUMMARY.md): Summary of the upgrade process
- [**REACT-V19-UPGRADE.md**](./REACT-V19-UPGRADE.md): Main instructions for the upgrade process

### Detailed Planning

- [**react-v19-upgrade-plan.md**](./react-v19-upgrade-plan.md): Detailed plan for the upgrade
- [**react-v19-compatibility-analysis.md**](./react-v19-compatibility-analysis.md): Analysis of potential compatibility issues

### Testing and Issues

- [**REACT-V19-TEST-PLAN.md**](./REACT-V19-TEST-PLAN.md): Test plan for the upgrade
- [**REACT-V19-ISSUES.md**](./REACT-V19-ISSUES.md): Known issues and their solutions

### Scripts

- [**pre-upgrade-check.sh**](./pre-upgrade-check.sh): Checks for potential compatibility issues
- [**upgrade-to-react-v19.sh**](./upgrade-to-react-v19.sh): Performs the actual upgrade
- [**post-upgrade-verify.sh**](./post-upgrade-verify.sh): Verifies that everything works correctly after the upgrade

### Configuration

- [**vite.config.react-v19.js**](./vite.config.react-v19.js): Vite configuration for React v19

## NPM Scripts

The following npm scripts are available to help with the upgrade process:

```bash
# Check for potential compatibility issues
npm run upgrade:check

# Review upgrade plan and analysis
npm run upgrade:plan
npm run upgrade:analyze

# Perform the upgrade
npm run upgrade:react19

# Verify the upgrade
npm run upgrade:verify
```

## Getting Started

To begin the upgrade process, follow these steps:

1. Read the [upgrade summary](./REACT-V19-UPGRADE-SUMMARY.md) to understand the overall process
2. Run the pre-upgrade check: `npm run upgrade:check`
3. Review the [upgrade plan](./react-v19-upgrade-plan.md) and [compatibility analysis](./react-v19-compatibility-analysis.md)
4. Perform the upgrade: `npm run upgrade:react19`
5. Verify the upgrade: `npm run upgrade:verify`
6. Follow the [test plan](./REACT-V19-TEST-PLAN.md) to ensure everything works correctly

## Contact

If you have any questions or issues with the upgrade process, please contact the project maintainers:

- Yuri Shkuro (@yurishkuro)
- Jonah Kowall (@jkowall)