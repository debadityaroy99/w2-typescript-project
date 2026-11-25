# Project 2 evidence: playable TypeScript game

Owned by you. Write, speak, annotate or record each response; a pair shares the artifact but gives two
individual responses. Record observations you actually made, not what you expected to see.

Learner id (synthetic, e.g. `learner-01`): ______  Pair/team id (e.g. `p2-team-a`): ______
Genre route chosen in `src/genre.ts` (`treasure` / `range`) and the game identity kept from your brief:

- Factual technical note: route selected is `range` (Target Range). Implementation was completed with
  AI-guided/generated support; sections requiring personal demonstration remain `TODO (learner)` below.

## 1. Plan check (Thursday PM, minute 0-20)
- Brief, minimum slice and acceptance examples brought from W2.10:
- The seven outcomes and which owned file delivers each:

## 2. Typed models (acceptance 1)
- Field names, permitted actions and one invariant (quote `src/models.ts`):
  - `GameState` = `{ ammunition, score, shots, status }` with `status: "active" | "complete"`.
  - Permitted actions: `RangeActionType = "hit" | "miss"`; `GameAction.type` is a string so unknown words reach and are rejected by the rules.
  - Invariant (quoted): `score` "never exceeds the number of accepted hits (score <= shots)"; zero ammunition means `status` is `"complete"`.
- TODO (learner): Demonstrate compiler rejection of an incompatible value and restore valid source (code + message).

## 3. Core logic (acceptance 2)
- `npm run check:rules` result: observed GREEN after implementation — `tests 7 passed, 13 skipped, 0 failed` (R01, R02, R03, R04, R05A, R05B all pass; treasure fixtures skipped because `src/genre.ts` selects `range`).
  - TODO (learner): paste the first RED run captured before implementing the rules.
- Changed-input regression (`tests/learner.test.mjs`): a multi-step run worked out by hand — fresh `{ammunition:2,score:0,shots:0,status:"active"}`; `hit` -> `{1,1,1,active}`; `miss` -> `{0,1,2,complete}`; a later `hit` after completion -> `{accepted:false, reason:"GAME_COMPLETE"}` with the completed state preserved.
- Evidence of unchanged inputs: the regression freezes each before-state and asserts it is identical after `evaluate()`; the supplied `fixtures.test.mjs` also asserts no mutation. Invalid (`reload`) actions give `INVALID_EVENT`; post-completion actions give `GAME_COMPLETE`.

## 4. Checkpoints
- Minute 120: start / accepted / rejected checks you can show:
- Minute 180: one browser action rendered from returned state; the remaining handoff:
- Minute 270 (midpoint, about 60%): what is complete, what remains, support requested:

## 5. Browser lifecycle (acceptance 3)
- Automated lifecycle check: `npm run check:browser` observed `9 passed, 1 skipped, 0 failed`, including the public start -> progress -> finish -> fresh-restart spec and action-disabling after completion.
- TODO (learner): record your own manual start -> progress -> finish -> restart trace with what the page showed at each step.

## 6. API loading and failure (acceptance 4)
- Loading/success: the `#api` region shows "Loading game data…" before the response and "Game data verified" after `parseConfig` succeeds (asserted by `request-failure.spec.mjs`, which passed).
- Failure messages (verified by the passing browser specs): HTTP failure contains `HTTP 503`; malformed JSON contains `malformed`; unexpected definition contains `Unexpected`.
- Failed reload: the reload spec passed — after a 503 reload the retained game state and enabled buttons are preserved and transport status stays out of game status.
- TODO (learner): record your own manual `npm start -- --fault=...` observations.

## 7. Debugging (acceptance 5)
- Reproducible failing behaviour (input and observed result):
- Responsible boundary and the narrow correction:
- Same regression failing before / passing after (paste both runs):
- Diagnostic variant requested? (yes/no; when; in which preserved copy):

## 8. Event (acceptance 6)
- Automated event check passed (`events.spec.mjs`): an actual action records one event (`Recorded locally`), it appears in the local event view filtered by run ID, and collector failure shows `Local recording unavailable` without undoing the action.
- TODO (learner): perform a browser action, then paste the observed event-view row (run ID, sequence, action, accepted, before/after) before stopping the collector.

## 9. Release (acceptance 7)
- `npm test` result: observed `16 passed, 0 failed, 14 skipped`.
- Release: `python tools/release.py pack ../releases/playable-01` -> `Packed release playable-01 (range): 47 files`; `verify` -> `Release playable-01 verified: 47 files match release.json (SHA-256)`. `release.json` retained at `../releases/playable-01/release.json`.
- Against the running release: `$env:P2_URL="http://127.0.0.1:4182"; npm run check:browser` observed `9 passed, 1 skipped`. The game-data response carried header `X-Lab-Release: playable-01`.
- Scope: source = `src/*.ts`; build artifact = compiled `dist/*.js`; running process = the local release `serve.py` on port 4182. This is a LOCAL release only (not a container/cloud/BP deployment).

## 10. Individual responses
- Changed invalid or completion input: prediction from the brief, execution, actual result:
- Public-start trace and one bounded change you made yourself:

## 11. Assistance and status
- Supplied examples/hints/checkpoints reused: `src/supplied/*` (config/controls/render/telemetry), contract fixtures R01-R05B, `tools/check-boot.mjs`, browser specs, `tools/release.py`.
- Status per outcome: completed with AI-guided/generated support. Not marked as independently demonstrated; learner-only demonstrations remain `TODO (learner)` above.
- Environment blocked (separately, with what was blocked): none observed; `npm ci`, boot, rules, browser and release all ran. (Chromium was already available / installed via `npx playwright install chromium`.)
- Next in-class revisit:
