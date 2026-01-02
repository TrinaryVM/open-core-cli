# TrinaryVM Open-Core CLI Documentation

**Purpose**: Public documentation for TrinaryVM Open-Core CLI - Basic tetragram encoding and hybrid codec experimentation.

## Scope

This documentation site covers:

- **Tetragram Encoding**: Basic symbolic encoding using Supreme Mystery (.sm) tetragrams
- **Hybrid Codecs**: Lossless JSON encoding/decoding with tetragram strings
- **CLI Usage**: Command-line interface for encoding, decoding, and validation
- **Experimentation Tools**: Tools for testing symbolic encoding concepts

## What This Documentation Does NOT Cover

This is **not** the full TrinaryVM documentation. For enterprise features, see:

- **VLIW Dashboard**: 27×81 tetragram grid visualization (Enterprise/Private)
- **Full VM Implementation**: Runtime, compiler, cryptographic implementations (Private)
- **TriFHE Integration**: Full homomorphic encryption features (Enterprise/Private)

## Building the Site

```bash
npm install
npm start  # Local development
npm build  # Production build
```

## Deployment

This site is built with Docusaurus and can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

## Content Structure

- `/docs/getting-started/` - Installation and first steps
- `/docs/cli-reference/` - CLI command reference
- `/docs/tetragram-encoding/` - Tetragram encoding concepts
- `/docs/hybrid-codecs/` - JSON encoding/decoding with tetragrams
- `/docs/examples/` - Example programs and use cases
