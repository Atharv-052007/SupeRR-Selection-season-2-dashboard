# Final Audit Report

**SupeRR Selector Season 2 — independent verification of the pressure rankings**

**Status: `READY WITH DISCLOSED LIMITATIONS`**

| | |
|---|---|
| Audit date | 17 November 2026 |
| Audited deliverable | Top 10 batters, top 10 bowlers, methodology report, evidence file, dashboard data |
| Data scope | IPL and T20 Internationals, 2022 onwards, as supplied |
| Random seed | 20261117 |
| Independent checks | 27 passed, 0 warnings, 0 failed |
| Auditor | Automated independent re-implementation (`tests/audit_core.py`) |

## 1. Verdict

The submission reproduces exactly. A separate implementation, written from the documented specification and reading only the raw CSVs, rebuilds the 193,988-delivery population, the pre-delivery pressure scores, every player aggregate, the reliability scores, the eligibility gates and both final top 10s. The largest disagreement on any unrounded score is below 1e-13, and the top-10 order is identical. The cross-artifact checks also pass: the CSVs, the evidence file, the dashboard data and the report all describe the same 20 players with the same ranks and scores.

The status is **READY WITH DISCLOSED LIMITATIONS**, not an unqualified pass. The arithmetic and the pipeline are verified, but the ranking is a statistical estimate. Bootstrap rank intervals overlap across most of the top 10, the pressure threshold is a material modelling choice, and the combined IPL/T20I list hides real format differences. Those limitations are documented in the methodology report and repeated in Section 7 below. They do not invalidate the selections; they limit how finely the order should be read.

**What was verified:**

- The raw scope, exclusions and delivery identity, including the innings component of the key.
- Cricket accounting: batter runs, extras, legal balls, batter dismissals, bowler-credited wickets.
- The pre-delivery pressure model, recomputed from raw score, wickets, balls, target and phase.
- Player pressure and normal aggregates for all 824 batters and 596 bowlers.
- Reliability scores, eligibility status, ranks and the final batting and bowling top 10s.
- Consistency between the CSVs, `TOP_10_EVIDENCE.json`, `dashboard.json` and the report numbers.
- Bootstrap interval structure and the presence of all 21 sensitivity scenarios.
- Existence, size and SHA-256 hash of every delivered file.

## 2. Independence and method

The audit does not import `ss_common.py`, `05_player_metrics.py`, `06_scoring_model.py` or `08_export_submission.py`. `tests/audit_core.py` re-reads `data/raw/*.csv`, applies the documented scope rules, rebuilds the delivery table and re-implements the pressure indices, empirical-Bayes shrinkage, robust z-scores, weights, eligibility rules and ranking logic from the specification. The delivered Parquet tables, CSVs, JSON files and report are then compared against that independent result.

This is a reproduction audit, not a peer review of the modelling choices. It can establish that the numbers are computed as described and that the artifacts agree. It cannot establish that the chosen weights are the only defensible weights; that question is addressed by the sensitivity analysis and the limitations section.

**Rebuild counts**

| Quantity | Value |
|---|---:|
| Raw deliveries in the source file | 200,999 |
| Duplicate raw delivery keys | 0 |
| Matches in scope | 837 |
| Regulation deliveries in scope | 193,988 |
| Non-IPL T20 matches excluded | 30 |
| Non-IPL T20 regulation deliveries excluded | 6,973 |
| In-scope super-over deliveries excluded | 26 |

A note on the super-over count: the raw file contains 38 super-over deliveries, but 12 of them sit inside the 30 excluded non-IPL T20 matches. The regulation analysis therefore removes 26 in-scope super-over deliveries, which is the figure used in the methodology report.

## 3. Check summary

| Category | Checks | Passed | Warnings | Failed |
|---|---:|---:|---:|---:|
| Data | 4 | 4 | 0 | 0 |
| Rebuild | 2 | 2 | 0 | 0 |
| Accounting | 3 | 3 | 0 | 0 |
| Player aggregation | 2 | 2 | 0 | 0 |
| Scoring | 2 | 2 | 0 | 0 |
| Eligibility | 3 | 3 | 0 | 0 |
| Rankings | 4 | 4 | 0 | 0 |
| Artifacts | 3 | 3 | 0 | 0 |
| Uncertainty | 1 | 1 | 0 | 0 |
| Deliverables | 2 | 2 | 0 | 0 |
| Robustness | 1 | 1 | 0 | 0 |
| **Total** | **27** | **27** | **0** | **0** |

## 4. Detailed results

| ID | Check | Result | Evidence |
|---|---|:---:|---|
| A1 | Raw delivery keys are unique | PASS | 0 duplicate keys in 200,999 raw rows |
| A2 | Scope match counts reproduce | PASS | 837 matches, 193,988 regulation deliveries |
| A3 | Non-IPL T20 competitions excluded | PASS | 30 matches / 6,973 regulation deliveries excluded |
| A4 | Super overs excluded from regulation analysis | PASS | 26 in-scope super-over deliveries excluded (38 exist in the raw file) |
| B1 | Rebuilt delivery identity matches the analysis file | PASS | 193,988 rebuilt vs 193,988 saved rows |
| B2 | Pressure scores and pre-delivery state recompute exactly | PASS | max absolute difference 0.00e+00 |
| C1 | Official scorecard accounting reproduces (WI v ENG, 1st T20I 2022) | PASS | bat runs 100/99 (official 100/99), wickets 10/1; lower-bound team totals 103/101 vs official 103/104 |
| C2 | Batter out excludes retired out | PASS | no retired-out delivery is charged as a batter dismissal |
| C3 | Bowler wickets limited to credited dismissals | PASS | run-outs, retired out and obstructing are not credited to bowlers |
| D1 | Batter pressure aggregates recompute independently | PASS | max difference 0.00e+00 across 824 batters |
| D2 | Bowler pressure aggregates recompute independently | PASS | max difference 0.00e+00 across 596 bowlers |
| D3 | Batter reliability scores recompute independently | PASS | max score difference 9.95e-14 |
| D4 | Bowler reliability scores recompute independently | PASS | max score difference 1.71e-13 |
| E1 | Fully eligible pool sizes reproduce | PASS | 67 batters / 52 bowlers |
| E2 | Final batting top 10 reproduces from raw data | PASS | Tim David, Mark Chapman, Suryakumar Yadav, Ashutosh Sharma, Rovman Powell, David Miller, Dinesh Karthik, Ayush Badoni, Namboori Tilak Varma, Dhruv Jurel |
| E3 | Final bowling top 10 reproduces from raw data | PASS | Matheesha Pathirana, Sunil Narine, Ravichandran Ashwin, Rashid Khan, Haris Rauf, Jasprit Bumrah, Mohammed Siraj, Yuzvendra Chahal, Josh Hazlewood, Noor Ahmad |
| E4 | Ranks are consecutive 1-10 and unique | PASS | both CSVs carry ranks 1-10 |
| E5 | Every selected player is Fully Eligible | PASS | top-10 rows all show Fully Eligible |
| E6 | Minimum sample rules met by every selection | PASS | balls/innings thresholds satisfied |
| E7 | CSV scores and pressure stats match recomputation | PASS | all 20 rows within rounding tolerance |
| F1 | Evidence JSON matches the final CSVs | PASS | 20 evidence cards align on player, rank and score |
| F2 | Dashboard data matches the final CSVs | PASS | dashboard player cards and rankings align on all 20 rows |
| F3 | Report numbers match the final CSVs | PASS | report top-10 arrays reproduce the delivered order |
| G1 | Bootstrap interval ordering and probabilities are valid | PASS | 233 batter and 217 bowler bootstrap rows validated |
| H1 | All required submission files exist and are non-empty | PASS | all present |
| H2 | Report contains evidence for all 20 selected players | PASS | every selected player name appears in the methodology report |
| H3 | Sensitivity suite is complete (21 scenarios) | PASS | 21 scenarios present |

### 4.1 Reproduction accuracy

| Quantity | Maximum absolute difference |
|---|---:|
| Delivery field `bat_pressure` | 0.00e+00 |
| Delivery field `bowl_pressure` | 0.00e+00 |
| Delivery field `team_runs` | 0.00e+00 |
| Delivery field `bowler_runs` | 0.00e+00 |
| Delivery field `score_before` | 0.00e+00 |
| Delivery field `wkts_before` | 0.00e+00 |
| Delivery field `legal_before` | 0.00e+00 |
| Batter metric `p_balls` | 0.00e+00 |
| Batter metric `p_runs` | 0.00e+00 |
| Batter metric `p_dismissals` | 0.00e+00 |
| Batter metric `p_SR` | 0.00e+00 |
| Batter metric `p_boundary_pct` | 0.00e+00 |
| Batter metric `p_dot_pct` | 0.00e+00 |
| Batter metric `n_SR` | 0.00e+00 |
| Batter metric `lift_SR` | 0.00e+00 |
| Bowler metric `p_balls` | 0.00e+00 |
| Bowler metric `p_wickets` | 0.00e+00 |
| Bowler metric `p_runs` | 0.00e+00 |
| Bowler metric `p_econ` | 0.00e+00 |
| Bowler metric `p_dot_pct` | 0.00e+00 |
| Bowler metric `n_econ` | 0.00e+00 |
| Bowler metric `lift_econ` | 0.00e+00 |
| Batter reliability score | 9.95e-14 |
| Bowler reliability score | 1.71e-13 |

Differences are floating-point noise. The player-level comparison covers all 824 batters and 596 bowlers in the scored tables, not only the selected players.

## 5. Reproduction of the final lists

### 5.1 Batters

| Rank | Player | Team | Pressure balls | Audited score | Delivered score | Rounded difference |
|---:|---|---|---:|---:|---:|---:|
| 1 | Tim David | Mumbai Indians | 445 | 97.10 | 97.10 | 0.00e+00 |
| 2 | Mark Chapman | New Zealand | 295 | 96.59 | 96.59 | 0.00e+00 |
| 3 | Suryakumar Yadav | Mumbai Indians | 504 | 96.35 | 96.35 | 0.00e+00 |
| 4 | Ashutosh Sharma | Delhi Capitals | 248 | 96.19 | 96.19 | 0.00e+00 |
| 5 | Rovman Powell | West Indies | 726 | 94.12 | 94.12 | 0.00e+00 |
| 6 | David Miller | Gujarat Titans | 660 | 93.74 | 93.74 | 0.00e+00 |
| 7 | Dinesh Karthik | Royal Challengers Bengaluru | 358 | 93.13 | 93.13 | 0.00e+00 |
| 8 | Ayush Badoni | Lucknow Super Giants | 465 | 90.29 | 90.29 | 0.00e+00 |
| 9 | Namboori Tilak Varma | Mumbai Indians | 712 | 89.35 | 89.35 | 0.00e+00 |
| 10 | Dhruv Jurel | Rajasthan Royals | 257 | 88.41 | 88.41 | 0.00e+00 |

### 5.2 Bowlers

| Rank | Player | Team | Pressure balls | Audited score | Delivered score | Rounded difference |
|---:|---|---|---:|---:|---:|---:|
| 1 | Matheesha Pathirana | Chennai Super Kings | 529 | 94.40 | 94.40 | 0.00e+00 |
| 2 | Sunil Narine | Kolkata Knight Riders | 466 | 92.58 | 92.58 | 0.00e+00 |
| 3 | Ravichandran Ashwin | Rajasthan Royals | 379 | 91.13 | 91.13 | 0.00e+00 |
| 4 | Rashid Khan | Gujarat Titans | 819 | 84.90 | 84.90 | 0.00e+00 |
| 5 | Haris Rauf | Pakistan | 380 | 83.33 | 83.33 | 0.00e+00 |
| 6 | Jasprit Bumrah | Mumbai Indians | 504 | 82.22 | 82.22 | 0.00e+00 |
| 7 | Mohammed Siraj | Royal Challengers Bengaluru | 451 | 79.66 | 79.66 | 0.00e+00 |
| 8 | Yuzvendra Chahal | Rajasthan Royals | 804 | 79.43 | 79.43 | 0.00e+00 |
| 9 | Josh Hazlewood | Royal Challengers Bengaluru | 443 | 76.65 | 76.65 | 0.00e+00 |
| 10 | Noor Ahmad | Chennai Super Kings | 554 | 76.60 | 76.60 | 0.00e+00 |

The CSV files round scores to two decimals, so the displayed difference is at most 0.005. Before rounding, the audited and delivered scores agree to better than 1e-13.

Both lists reproduce player for player and position for position. The audit also confirms that 67 batters and 52 bowlers meet the full-sample rule, and that every selected player clears the pressure-ball, innings and match minima.

## 6. Deliverable integrity

| File | Size | SHA-256 |
|---|---:|---|
| `FINAL_TOP_10_BATTERS.csv` | 2.1 kB | `ce4dd15db1ebeb4e56c49b3173e3581bb889f332296eaab086ab3ef2b1651b17` |
| `FINAL_TOP_10_BOWLERS.csv` | 2.3 kB | `694a953c0b9842b6488ebd43d662210c823f3edaa55acca7c87268b73fbce958` |
| `ELIGIBILITY_TABLE.csv` | 125.5 kB | `b7286ae6203ceb03cb8ff49953f3fddd9ff414f937b89b05fc050a20c08a61a9` |
| `FINAL_METHODOLOGY_REPORT.pdf` | 1.91 MB | `c83411b7a2a5762637513452603f50ff5b3858a0851a0867514fd12701e10649` |
| `FINAL_METHODOLOGY_REPORT.docx` | 830.1 kB | `1fbdc85d62af1d13c5979d865ae193605fb07fee17ce2b33084819829a13b7f4` |
| `FINAL_METHODOLOGY_REPORT.md` | 103.1 kB | `384c06a1ebfd05e0312e767c1e395b884a130fb6522fe54161f8344fb131f37a` |
| `TOP_10_EVIDENCE.json` | 121.7 kB | `73697a7b9faa6b87983e8273d568e59ae104b7e6450c9f7aed9baaa305860760` |

Hashes are recorded so a reviewer can confirm that the audited bytes are the delivered bytes. The methodology report's own PDF and DOCX are generated from the same block list as the Markdown source; the Markdown is the reference text.

## 7. Disclosed limitations

These limitations are material and are repeated here so the status is not read as an unqualified endorsement.

| Topic | Evidence | Impact |
|---|---|---|
| **Ranking uncertainty** | Bootstrap 95% rank intervals overlap for most of the top 10; top-10 membership probabilities range from 0.33 to 0.74 (batting) and 0.41 to 0.92 (bowling). | The exact order beyond the top few is not statistically firm; the list identifies a credible pool, not a precise ladder. |
| **Pressure threshold** | Stricter thresholds change 5/10 batting and 2/10 bowling selections; lenient thresholds change 6/10 and 4/10. | Membership is sensitive to where 'pressure' is cut; the locked definition is defensible but not uniquely correct. |
| **Competition pooling** | IPL-only and T20I-only rankings overlap 6/10 and 8/10 (batting/bowling) and 3/10 and 1/10 respectively. | The combined list answers the brief, but format-specific lists differ materially. |
| **Team-run lower bound** | Multi-run byes/leg-byes and wides are not encoded; reconstructed team totals undercount by roughly 1-2 runs per innings. | Required run rate and projected totals carry a small bias; sensitivity tests show rankings are stable to it. |
| **Single-format players** | Chapman (T20I only), Ashutosh, Badoni and Narine (IPL only), Haris Rauf (T20I only) are selected on one competition. | Cross-format robustness cannot be checked for these players; their evidence is disclosed in the report. |

The first three limitations are the reason for the qualified status. The last two are smaller, but they affect specific players and are stated in the relevant player evidence blocks.

## 8. What this audit does not cover

- **Correctness of the supplied data.** The audit verifies internal consistency and one published scorecard spot check. It cannot prove that every source row is complete or correctly entered.
- **Statistical optimality of the weights.** The weights are a documented judgement, tested by 21 sensitivity scenarios. The audit confirms they are applied as stated, not that they are uniquely best.
- **Selection constraints.** Availability, fitness, role balance, auction rules and team composition are outside the model and outside this audit.
- **Dashboard interaction testing.** The audit checks the data contract behind the dashboard. Page rendering and interaction were smoke-tested separately during the build.

## 9. Reproduction

```text
python analysis/scripts/01_inspect_data.py
python analysis/scripts/02_inspect_runs.py
python analysis/scripts/04_validate_pressure.py
python analysis/scripts/05_player_metrics.py
python analysis/scripts/06_scoring_model.py
python analysis/scripts/07_sensitivity.py
python analysis/scripts/08_export_submission.py
python analysis/scripts/09_build_report.py
python analysis/scripts/11_audit.py
python -m unittest discover -s tests -v
```

The pipeline is linear and deterministic apart from the bootstrap, which uses the fixed seed `20261117`. Re-running the scripts on the supplied raw files reproduces the delivered tables, scores and lists.

## 10. Sign-off

| | |
|---|---|
| Audit result | **READY WITH DISCLOSED LIMITATIONS** |
| Checks | 27 passed, 0 warnings, 0 failed |
| Date | 17 November 2026 |
| Basis | Independent re-implementation from raw CSVs plus cross-artifact consistency checks |

The submission is ready to hand over with the limitations above disclosed. The rankings should be presented as a defensible, reproducible ordering of pressure performance, not as a precise or permanent ranking of player quality.
