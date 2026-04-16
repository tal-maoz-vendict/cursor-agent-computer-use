#!/usr/bin/env bash
# Deterministic: validate each commit in a draft PR is <= 400 lines changed
# (insertions + deletions), then open one GitHub PR per commit.
#
# Requires: git, gh (authenticated), network for fetch/gh.
#
# Usage:
#   scripts/draft-pr-to-mini-prs.sh --pr <number|url> [--base-branch main] [--repo owner/name] [--remote origin] [--dry-run]
#
# Stacked PRs (default): PR #1 targets --base-branch; each following PR targets
# the previous mini-PR branch so each PR still shows exactly one new commit.
#
#   --flat: each mini-PR is one cherry-pick onto <base-branch> only (fails if
#           a commit does not apply cleanly without prior commits).

set -euo pipefail

readonly MAX_LINES_PER_COMMIT=400
readonly FAIL_MSG='PR draft is not ready for commits to mini-PRs conversion'

usage() {
  cat <<'USAGE'
Usage: draft-pr-to-mini-prs.sh --pr <number|url> [options]

Options:
  --pr <n|url>       Draft PR number or GitHub PR URL (required)
  --base-branch <b>  Integration branch to merge into (default: main)
  --repo <o/r>       owner/repo (default: gh repo or GITHUB_REPOSITORY)
  --remote <name>    Git remote to fetch/push (default: origin)
  --flat             Each cherry-pick onto base only (no stacked bases)
  --dry-run          Validate only; do not push or create PRs
  -h, --help         This help

Environment:
  GITHUB_REPOSITORY  Used when --repo is omitted and gh context is unavailable
USAGE
}

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

PR_NUMBER=''
BASE_BRANCH='main'
REPO_SLUG=''
REMOTE_NAME='origin'
FLAT=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pr)
      [[ $# -lt 2 ]] && die "missing value for --pr"
      PR_NUMBER=$2
      shift 2
      ;;
    --base-branch)
      [[ $# -lt 2 ]] && die "missing value for --base-branch"
      BASE_BRANCH=$2
      shift 2
      ;;
    --repo)
      [[ $# -lt 2 ]] && die "missing value for --repo"
      REPO_SLUG=$2
      shift 2
      ;;
    --remote)
      [[ $# -lt 2 ]] && die "missing value for --remote"
      REMOTE_NAME=$2
      shift 2
      ;;
    --flat)
      FLAT=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1 (try --help)"
      ;;
  esac
done

[[ -n "$PR_NUMBER" ]] || die "--pr is required"

if [[ "$PR_NUMBER" =~ ^https?:// ]]; then
  if [[ "$PR_NUMBER" =~ /pull/([0-9]+) ]]; then
    PR_NUMBER="${BASH_REMATCH[1]}"
  else
    die "could not parse PR number from URL: $PR_NUMBER"
  fi
fi

[[ "$PR_NUMBER" =~ ^[0-9]+$ ]] || die "invalid PR number: $PR_NUMBER"

command -v git >/dev/null 2>&1 || die "git is not installed"
command -v gh >/dev/null 2>&1 || die "gh is not installed"

if [[ -z "$REPO_SLUG" ]]; then
  if [[ -n "${GITHUB_REPOSITORY:-}" ]]; then
    REPO_SLUG=$GITHUB_REPOSITORY
  else
    REPO_SLUG=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null) \
      || die "set --repo or GITHUB_REPOSITORY, or run gh auth login in this repo"
  fi
fi

is_draft=$(gh pr view "$PR_NUMBER" --repo "$REPO_SLUG" --json isDraft -q .isDraft 2>/dev/null) \
  || die "could not read PR #$PR_NUMBER in $REPO_SLUG"
[[ "$is_draft" == "true" ]] || die "PR #$PR_NUMBER is not a draft; refusing to proceed"

printf 'Fetching %s and PR #%s head...\n' "$REMOTE_NAME" "$PR_NUMBER"
git fetch "$REMOTE_NAME" "$BASE_BRANCH"
git fetch "$REMOTE_NAME" "pull/$PR_NUMBER/head:refs/heads/_mini_pr_src/$PR_NUMBER"

LOCAL_HEAD="_mini_pr_src/$PR_NUMBER"
MERGE_BASE=$(git merge-base "$LOCAL_HEAD" "$REMOTE_NAME/$BASE_BRANCH") \
  || die "could not compute merge-base between PR head and $REMOTE_NAME/$BASE_BRANCH"

mapfile -t COMMITS < <(git rev-list --reverse "$MERGE_BASE".."$LOCAL_HEAD")
[[ ${#COMMITS[@]} -gt 0 ]] || die "no commits between merge-base and PR head"

lines_for_commit() {
  local sha=$1
  local parents
  parents=$(git rev-list --parents -n 1 "$sha" | awk '{print NF-1}')
  if [[ "$parents" != 1 ]]; then
    printf '%s\n' "non-linear commit (merge/octopus): $sha" >&2
    printf '%s\n' "$FAIL_MSG" >&2
    exit 1
  fi
  local parent
  parent=$(git rev-parse "${sha}^")
  # shortstat: "N files changed, X insertions(+), Y deletions(-)"
  local stat ins del
  stat=$(git diff --shortstat "$parent" "$sha")
  ins=0
  del=0
  if [[ -n "$stat" ]]; then
    ins=$(printf '%s' "$stat" | sed -nE 's/.* ([0-9]+) insertion(s)?\(\+\).*/\1/p')
    del=$(printf '%s' "$stat" | sed -nE 's/.* ([0-9]+) deletion(s)?\(-\).*/\1/p')
    [[ -n "$ins" ]] || ins=0
    [[ -n "$del" ]] || del=0
  fi
  printf '%d' $((ins + del))
}

printf 'Validating %d commit(s) (max %d lines each)...\n' "${#COMMITS[@]}" "$MAX_LINES_PER_COMMIT"
for sha in "${COMMITS[@]}"; do
  lines=$(lines_for_commit "$sha")
  subj=$(git log -1 --format=%s "$sha")
  printf '  %s  %s lines  %s\n' "${sha:0:7}" "$lines" "$subj"
  if ((lines > MAX_LINES_PER_COMMIT)); then
    printf '%s\n' "$FAIL_MSG" >&2
    exit 1
  fi
done

printf 'Validation passed.\n'

if [[ "$DRY_RUN" -eq 1 ]]; then
  printf 'Dry run: skipping branch push and gh pr create.\n'
  exit 0
fi

sanitize_slug() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9._-]+/-/g' | sed -E 's/-+$//' | cut -c1-40
}

stack_base_branch=$BASE_BRANCH
stack_parent_ref=$(git rev-parse --verify "$REMOTE_NAME/$BASE_BRANCH")

for i in "${!COMMITS[@]}"; do
  sha=${COMMITS[$i]}
  idx=$((i + 1))
  short=${sha:0:7}
  slug=$(sanitize_slug "$(git log -1 --format=%s "$sha")")
  [[ -n "$slug" ]] || slug="commit"
  branch_name="cursor/mini-pr-${PR_NUMBER}-${idx}-${short}-${slug}-23d5"

  if [[ "$FLAT" -eq 1 ]]; then
    git branch -f "$branch_name" "$(git rev-parse --verify "$REMOTE_NAME/$BASE_BRANCH")"
    stack_parent_ref=$(git rev-parse --verify "$REMOTE_NAME/$BASE_BRANCH")
    gh_pr_base=$BASE_BRANCH
  else
    git branch -f "$branch_name" "$stack_parent_ref"
    gh_pr_base=$stack_base_branch
  fi

  git switch "$branch_name"
  if ! git cherry-pick "$sha"; then
    git cherry-pick --abort 2>/dev/null || true
    die "cherry-pick failed for $sha onto $stack_parent_ref; resolve conflicts manually or try --flat if commits are independent"
  fi

  printf 'Pushing %s ...\n' "$branch_name"
  git push -u "$REMOTE_NAME" "$branch_name"

  title=$(git log -1 --format=%s "$sha")
  body=$(printf 'Split from draft PR #%s (%s).\n\nThis PR contains a single commit: `%s`.\n' \
    "$PR_NUMBER" "$REPO_SLUG" "$sha")

  printf 'Creating PR (head %s, base %s) in %s...\n' "$branch_name" "$gh_pr_base" "$REPO_SLUG"
  gh pr create --repo "$REPO_SLUG" --base "$gh_pr_base" --head "$branch_name" \
    --title "$title" --body "$body"

  if [[ "$FLAT" -eq 0 ]]; then
    stack_base_branch=$branch_name
    stack_parent_ref=$(git rev-parse HEAD)
  fi
done

printf 'Done. Created %d mini-PR(s).\n' "${#COMMITS[@]}"
