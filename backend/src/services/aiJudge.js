// TODO: Replace mock with real Claude API call — see docs/development/prd.md §3.5
//
// Future signature will accept the image file path and the design spec,
// then call the Claude vision API to score the submission.
// For now, returns a deterministic mock score based on the submissionId hash.

/**
 * Score a design submission.
 * @param {string} submissionId - The filename/UUID of the uploaded image.
 * @param {object} spec - The design brief (unused in stub, needed for real AI).
 * @returns {number} A score between 3.0 and 5.0, rounded to one decimal.
 */
function scoreSubmission(submissionId, spec) {
  let hash = 0
  for (const ch of (submissionId || 'none')) {
    hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  }
  return Math.round((3.0 + (hash / 0xffff) * 2.0) * 10) / 10
}

module.exports = { scoreSubmission }
