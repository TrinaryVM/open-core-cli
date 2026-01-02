#!/bin/bash
# Completely reset Git history - creates a fresh repository with one initial commit

set -e

echo "⚠️  WARNING: This will DELETE ALL Git history!"
echo ""
echo "This will:"
echo "  1. Remove all commit history"
echo "  2. Create a single new initial commit with current files"
echo "  3. Require force push to GitHub"
echo "  4. Require all team members to re-clone"
echo ""
read -p "Are you ABSOLUTELY SURE? Type 'RESET HISTORY' to confirm: " confirm

if [ "$confirm" != "RESET HISTORY" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Creating fresh Git history..."

# Create a new orphan branch (no history)
git checkout --orphan new-main

# Add all files
git add -A

# Create the initial commit
git commit -m "Initial commit"

# Delete the old main branch
git branch -D main

# Rename current branch to main
git branch -m main

echo ""
echo "✅ Git history reset complete!"
echo ""
echo "Current commit:"
git log --oneline
echo ""
echo "Next steps:"
echo "  1. Force push to GitHub: git push origin --force --all"
echo "  2. Force push tags (if any): git push origin --force --tags"
echo "  3. Notify team to re-clone the repository"
echo ""
echo "⚠️  WARNING: This will overwrite history on GitHub!"

