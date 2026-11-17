# Pressure Performance and Reliability

### Final Methodology Report — Top 10 Batters and Bowlers

**Challenge:** Rajasthan Royals SupeRR Selector Season 2, Round 1  
**Data window:** IPL and T20 Internationals, 2022 to 2026  
**Population:** 837 matches · 193,988 deliveries · 824 batters · 596 bowlers  
**Final sample:** 67 fully eligible batters · 52 fully eligible bowlers  
**Version:** 1.0 — 17 November 2026  
**Random seed:** 20261117  
**Status:** READY WITH DISCLOSED LIMITATIONS (see the independent audit report)  

## Contents

- Executive summary
- 1. The brief and how this report answers it
- 2. Data, scope and coverage
- 3. Correct cricket accounting
- 4. What counts as pressure
- 5. The Batting and Bowling Pressure Indices
- 6. Does the pressure model work?
- 7. From pressure to player performance
- 8. Fair comparison across samples and competitions
- 9. The Reliability Score
- 10. Final batting top 10
- 11. Final bowling top 10
- 12. Reading the list: what it says and what it does not
- 13. Reliability and uncertainty
- 14. Sensitivity analysis
- 15. Limitations and disclosures
- 16. Reproducibility and independent audit
- 17. Conclusion
- Appendix A. Formula reference
- Appendix B. Eligibility and sample distribution
- Appendix C. Glossary
- Appendix D. Deliverable manifest

# Executive summary

This report ranks batters and bowlers by how well they perform when the match is under pressure, compared with their own normal performance. Pressure is measured before each ball is bowled, using only information available at that moment: the score, wickets lost, balls remaining, the target or par score, the phase of the innings and a projection of the finish. The outcome of the ball is never an input. The rankings come from the supplied IPL and T20I ball-by-ball data for 2022 onwards; no reputation, salary, auction value or future information is used.

The analysed population contains **837 matches** and **193,988 regulation deliveries** (87,673 IPL and 106,315 T20I). The pressure sample — deliveries classified High or Extreme — contains **50,643 batter balls** (27.2% of all balls faced) and **56,512 legal balls** charged to bowlers (30.4% of all legal balls). After sample-size rules, **67 batters** and **52 bowlers** are fully eligible for a final ranking.

**The headline results.**

- **Batting:** Tim David ranks first with a Reliability Score of **97.1**, followed by Mark Chapman (96.6) and Suryakumar Yadav (96.3). The ten selected batters scored 7,627 pressure runs at a combined strike rate of 163.3.
- **Bowling:** Matheesha Pathirana ranks first with **94.4**, followed by Sunil Narine (92.6) and Ravichandran Ashwin (91.1). The ten selected bowlers took 384 pressure wickets at a combined economy of 8.65.
- **The pressure model separates outcomes.** The dismissal rate rises from 5.13% on Normal batting balls to 9.77% on Extreme balls. Bowling economy rises from 8.08 to 10.20 per over, and the wicket rate rises from 4.87% to 8.57%. The gradient holds within each phase for economy and for batting strike rate.
- **The ranking is a point estimate, not a guarantee.** In 1,000 bootstrap resamples the probability of a top-10 finish ranges from 0.74 to 0.36 for the selected batters, and from 0.92 to 0.41 for the bowlers. Ranks 4–10 are best read as a cohort.
- **The result is robust in parts.** Changing the component weights leaves 7–10 of each top 10 unchanged; changing the eligibility rule leaves 8–10. Changing the pressure thresholds is more consequential (5 of 10 batters and 2 of 10 bowlers survive a stricter definition). This is disclosed, not hidden.
- **Single-format players are flagged.** Seven of the ten batters and eight of the ten bowlers have pressure evidence in both IPL and T20I. Mark Chapman (T20I), Ashutosh Sharma and Ayush Badoni (IPL), Sunil Narine (IPL) and Haris Rauf (T20I) are selected on one format. Their profiles state this.

The independent audit re-implements the pipeline from the cleaned deliveries and checks the rankings, the CSV files, the dashboard data and the report. Its status is **READY WITH DISCLOSED LIMITATIONS**. The limitations are material enough to state plainly — wide bootstrap rank intervals, sensitivity to the pressure threshold and the pooling of two competitions — but they do not invalidate the method or the selections. Sections 13–15 set out the evidence for that judgement.

---

# 1. The brief and how this report answers it

The official problem statement asks for a data-driven system that measures how batters and bowlers perform in high-pressure match situations compared with their usual performance, and then uses that system to rank the players who deliver most consistently when it matters. It deliberately does not prescribe a pressure definition, a metric set or a model. The requirement is that the choices are defined, justified, applied consistently and supported by evidence.

The system in this report follows one principle throughout: **measure the situation before the ball, then measure what the player did with it.** This keeps the definition of pressure separate from the outcome and makes the comparison between pressure and normal performance meaningful rather than circular.

**Table 1. Requirement-to-output map.**

| Requirement | How it is addressed | Where |
| :--- | :--- | :---: |
| Define pressure | A pre-delivery Batting Pressure Index (BPI) and Bowling Pressure Index (WPI), each built from four weighted components. | §4–5 |
| Explain why the definition is meaningful | Outcome validation by pressure band; within-phase checks; component correlations. | §6 |
| Show separation from ordinary play | Dismissal rate, strike rate, economy and wicket rate by band; charts and tables. | §6 |
| Work for batting and bowling | Separate indices, separate metrics, separate eligibility rules and separate top 10s. | §4–11 |
| Batting and bowling metrics | Strike rate, average, boundary rate, dot rate, wickets, economy, strike rate and context splits. | §7 |
| Player baselines | The player's own Normal-band performance, plus fixed format-level priors. | §7–8 |
| Rating and scoring logic | Robust z-scores, empirical-Bayes shrinkage, weighted composite, normal-CDF score. | §9 |
| Sample sizes and eligibility | Minimum pressure balls, innings and matches; shrinkage; confidence multiplier; bootstrap. | §8, §13 |
| Different match contexts | Format-relative baselines; phase, chase/defence and season splits; format flags. | §7, §12 |
| IPL and T20I data | Both included; every rate expressed against its own format baseline; single-format players flagged. | §2, §7 |
| Evidence for each selection | Twenty player evidence blocks with pressure vs normal, lift, consistency, top innings and uncertainty. | §10–11 |
| Rank 1 justification | Explicit cases for Tim David and Matheesha Pathirana, including why they lead. | §10–11 |
| No repeated player | Automated uniqueness test on both top-10 lists. | §16 |
| Consistency across matches | Positive-innings rate, season consistency and a combined consistency index. | §7, §9 |
| Reliability and limitations | Bootstrap intervals, 21 sensitivity scenarios, a dedicated limitations section. | §13–15 |
| Reproducibility | Linear scripts, fixed seed, data dictionary, audit re-implementation, file hashes. | §16, App. D |
| Top-10 CSVs and report | FINAL_TOP_10_BATTERS.csv, FINAL_TOP_10_BOWLERS.csv and this report in PDF, DOCX and Markdown. | §16, App. D |

*Section numbers refer to this report. The companion dashboard presents the same scored tables interactively.*

---

# 2. Data, scope and coverage

The submission uses six supplied files: matches, competitions, teams, playing elevens, the competition-to-team-to-player mapping, and ball-by-ball deliveries. The raw files were copied to a read-only folder and never edited. Every derived table is produced by the scripts in `analysis/scripts/` from those six files. No external data, scraped scorecards, market values or manually entered player statistics were used.

**Scope rules.** The official challenge covers the IPL and T20 Internationals from 2022 onwards. The scope was applied at match level before any delivery was analysed:

**Table 2. Scope and exclusion rules.**

| Decision | Rule | Effect |
| :--- | :--- | :--- |
| Competitions | `match_format == 'T20'` and competition name starts with IPL, or `match_format == 'T20I'`. | Keeps IPL and T20I only. |
| Non-IPL T20 | Excluded. | 30 matches and 6,973 deliveries removed. |
| Seasons | 2022 onwards, as labelled in the source. | 8 season labels, including split T20I seasons. |
| Super overs | Innings 3 and 4 excluded. | 26 in-scope deliveries removed; 12 more sit inside excluded matches. |
| Abandoned matches | No deliveries, so no evidence. | 16 matches absent from ball-level analysis. |
| One-innings matches | Retained for first-innings analysis; no chase metrics. | 22 matches. |
| Raw files | Read-only; never overwritten. | All transformations are additive. |

*Super-over deliveries remain in the raw file and are excluded only from the regulation-innings analysis.*

The in-scope data contains **837 matches** and **193,988 deliveries**. IPL contributes 367 matches and 87,673 deliveries; T20I contributes 470 matches and 106,315 deliveries. The delivery table covers 824 batters and 596 bowlers. A player appears in the table if they faced at least one ball or bowled at least one legal ball; appearing in the table is not the same as being eligible for a ranking.

**Table 3. Coverage and pressure-sample size by format.**

| Format | Matches | Deliveries | Batter balls | Pressure balls | Share | Legal balls | Pressure legal balls | Share |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| IPL (T20) | 367 | 87,673 | 84,121 | 21,950 | 26.1% | 83,864 | 26,907 | 32.1% |
| T20I | 470 | 106,315 | 102,394 | 28,693 | 28.0% | 102,086 | 29,605 | 29.0% |

*Pressure balls are those classified High or Extreme for the relevant role. Shares are within format.*

![Figure 1. Matches and deliveries by season and format. The 2022/23, 2023/24 and 2024/25 labels are short T20I windows, not full seasons.](coverage_season_format.png)

*Figure 1. Matches and deliveries by season and format. The 2022/23, 2023/24 and 2024/25 labels are short T20I windows, not full seasons.*

Two coverage facts matter for interpretation. First, the IPL is a concentrated tournament: 367 matches across five editions, with a stable team pool. T20I is a scattered international calendar: 470 matches across many venues, opponents and squad rotations. Second, the short T20I season labels (2022/23, 2023/24, 2024/25) contain very few matches. They are retained because they are real evidence, but they cannot support season-level conclusions on their own. Season consistency is therefore smoothed toward neutral for players with fewer than two seasons.

**Identity.** Every delivery is identified by `match_id + innings + overid + over_ball_num`. That four-part key has zero duplicates. A three-part key without `innings` has 92,072 collisions, which is why innings is mandatory in every join, aggregate and audit check.

---

# 3. Correct cricket accounting

A pressure model is only as good as the delivery accounting underneath it. The source encodes extras in a way that is easy to misread, so each rule below was implemented once, in `ss_common.py`, and reused everywhere.

**Table 4. How each delivery type is counted.**

| Delivery type | Batter ball? | Legal ball? | Charged to bowler? | Team runs | Treatment |
| :--- | :---: | :---: | :---: | :--- | :--- |
| Normal delivery | Yes | Yes | Yes | Bat runs | Standard. |
| Wide | No | No | Yes (at least 1) | 1 + bat runs if any | Not a ball faced; not a legal ball. |
| No-ball | Yes | No | Yes | 1 + bat runs + recorded extra | Bat runs are credited; the ball is not legal. |
| Bye | Yes | Yes | No | 1 | Legal ball; not charged to the bowler. |
| Leg-bye | Yes | Yes | No | 1 | Legal ball; not charged to the bowler. |
| Penalty | No | No | No | 5 | Excluded from batter and bowler figures. |
| Other extras | Yes | Yes | Yes if recorded | Recorded extra | Legal delivery with no automatic one-run assumption. |

*Multi-run byes, leg-byes and wides are not separately encoded in the source. Team runs are therefore a lower bound.*

Three source columns are especially important. **`runs` holds bat runs only**, not the team total. **`extras1_runs` is a type code**, not a run count: treating it as runs would corrupt every total. **`extras_2_runs` holds the limited additional extras** that the source records, mainly for some no-balls and 'other' deliveries. The cleaning step was verified against the official West Indies vs England first T20I of 22 January 2022: England 103 (100 bat runs + 3 wides) and West Indies 104/1 (99 bat runs + 5 leg-byes) reconcile exactly.

**The one structural gap.** The source does not record how many runs were run on a wide, or on a bye or leg-bye. Team runs are reconstructed as bat runs + recorded additional extras + one per wide/no-ball/bye/leg-bye + five per penalty. This undercounts some innings by roughly 1–2 runs. Across 44 matches decided by a runs margin, the reconstruction is exact in 29.5% of cases and within one run in 47.7%, with a mean absolute error of about 2.3 runs. Batter runs, balls faced, boundaries, bowler runs and wickets are unaffected because they come from the recorded bat runs and the delivery type.

**Table 5. Dismissal accounting across the cleaned data.**

| Dismissal | Count | Batter out? | Bowler wicket? | Why |
| :--- | ---: | :---: | :---: | :--- |
| Caught | 7,557 | Yes | Yes | Standard bowler credit. |
| Bowled | 1,775 | Yes | Yes | Standard bowler credit. |
| LBW | 709 | Yes | Yes | Standard bowler credit. |
| Run out | 600 | Yes | No | A fielding dismissal, not a bowling one. |
| Stumped | 214 | Yes | Yes | Credited to the bowler. |
| Hit wicket | 17 | Yes | Yes | Credited to the bowler. |
| Retire out | 6 | No | No | Not a performance failure; excluded from batting average. |
| Obstructing the field | 3 | Yes | No | Batter dismissal, not a bowler wicket. |

*Bowler wickets are Caught, Bowled, LBW, Stumped and Hit Wicket only.*

The practical consequence is that a bowler's figures exclude byes, leg-byes and penalties, and include wides and no-balls. A batter's balls faced exclude wides and penalties. A batter dismissed by a run-out is out for average purposes but the bowler does not receive a wicket. These are not cosmetic details: they change the denominator of every rate in the model.

---

# 4. What counts as pressure

Pressure is not a mood and it is not the result of a ball. It is a **pre-delivery state** in which the cost of the next action is unusually high. The model describes that state with four questions, asked before every delivery:

1. **How hard is the task?** For a chase, how far is the required run rate above the format par rate? For a side batting first, how far is the projected total below par?
2. **How constrained are the resources?** How many wickets are left, and how many balls remain in which to use them?
3. **How urgent is the phase?** Powerplay, middle overs or death overs. Phase is a structural prior, not a measure of a particular player's role.
4. **How close is the match?** A projected margin near zero is tighter than a projected blowout.

Each answer is scaled to 0–1. The batting and bowling indices then combine them with different weights, because the questions are not equally important to the two roles. The batting index is dominated by task difficulty (50%). The bowling index is dominated by the threat the batting side poses (55%), which combines the scoring threat with wickets in hand.

The outcome of the delivery — runs, a boundary, a wicket, a dot — is **never** an input. Nor is the final result, the player's later career or a season average computed from matches that had not yet happened. This is what makes the pressure-versus-normal comparison an evaluation rather than a tautology.

> The test of a pressure index is simple: does it identify situations in which good players actually find it harder to score and easier to get out? Section 6 shows that it does, and shows where it does not.

---

# 5. The Batting and Bowling Pressure Indices

## 5.1 Batting Pressure Index (BPI)

The BPI is a weighted average of four components, each on a 0–1 scale, multiplied by 100. The formulas below are the implemented formulas, not a simplified description.

```
task_chase   = sigmoid((RRR - par_RR - 0.30) / 1.60)          # second innings
task_first   = sigmoid(deficit_fraction / 0.09)               # first innings
bat_resource = 0.50 * (1 - (wickets_left / 10) ** (balls_left / scheduled_balls))
             + 0.50 * (wickets_lost / 10)
phase_w      = 0.30 (powerplay) | 0.55 (middle) | 0.85 (death)
closeness    = exp(-abs(projected_margin) / 20)

BPI = 100 * (0.50 * task + 0.22 * bat_resource + 0.16 * phase_w + 0.12 * closeness)
```

`RRR` is runs needed × 6 / balls left. `par_RR` is the format's par runs per over. The projection uses the current run rate shrunk toward the format baseline with a 30-ball prior, so one fast over cannot make a modest total look par. A chase that is already won has task = 0. The resource curve combines the 'cliff' effect of a short remaining batting order with the immediate weight of wickets already lost.

## 5.2 Bowling Pressure Index (WPI)

```
score_threat_chase = sigmoid((RRR - par_RR) / 2.20)
score_threat_first = sigmoid((shrunk_run_rate - par_run_rate) / 0.18)
bowl_threat        = 0.85 * score_threat + 0.15 * (wickets_left / 10)
bowl_resource      = (wickets_left / 10) * (0.50 + 0.50 * balls_left_fraction)
closeness          = exp(-abs(projected_margin) / 20)

WPI = 100 * (0.55 * bowl_threat + 0.05 * bowl_resource + 0.20 * phase_w + 0.20 * closeness)
```

The bowling index gives more weight to closeness (20% versus 12%) because a bowler's spell is most exposed when the match is tight and the batting side is attacking. Wickets in hand enter the threat term directly: a set batting side can attack with less risk. The resource term is deliberately small (5%) because it is largely implied by the threat term; Section 6 reports that it adds almost no independent signal, which is a known weakness rather than a hidden one.

## 5.3 Bands and the pressure sample

**Table 6. Pressure bands and how each band is used.**

| Band | Batting BPI | Bowling WPI | Role in the model |
| :--- | :---: | :---: | :--- |
| Normal | < 40 | < 45 | The player's own comparison baseline. |
| Moderate | 40–58 | 45–60 | Transition zone. Not pressure, not baseline. |
| High | 58–70 | 60–67 | Part of the pressure sample. |
| Extreme | > 70 | > 67 | Part of the pressure sample. |

*Thresholds are fixed model parameters. Section 14 tests stricter and more lenient alternatives.*

The ranking sample is **High + Extreme**: 50,643 batter balls and 56,512 legal balls. That is 27.2% of all balls faced and 30.4% of all legal balls. The Normal band is the player's own baseline. Moderate is excluded from both sides because it behaves like ordinary cricket: its dismissal rate is almost identical to Normal and its economy is only marginally higher. Including it would dilute the contrast the model is trying to measure.

![Figure 2. Distribution of the Batting Pressure Index (left) and Bowling Pressure Index (right), with the four bands marked.](pressure_distribution.png)

*Figure 2. Distribution of the Batting Pressure Index (left) and Bowling Pressure Index (right), with the four bands marked.*

The thresholds sit at sensible points in the observed distributions. The batting median is 47.7 and the 90th percentile is 67.1; the High cut at 58 is roughly the 72nd percentile and the Extreme cut at 70 is roughly the 93rd. The bowling median is 54.7 and the 90th percentile is 65.6; the High cut at 60 is roughly the 69th percentile and the Extreme cut at 67 is roughly the 92nd. The cuts were chosen from the distributions and then checked against outcomes, not chosen to produce a particular player list.

---

# 6. Does the pressure model work?

A pressure index is useful only if the situations it labels are genuinely harder. The test is external to the index: compare the outcomes of deliveries in each band. If the bands are meaningful, dismissal rates and scoring difficulty should rise as pressure rises.

**Table 7. Batting outcomes by pressure band.**

| Band | Balls | Runs | Strike rate | Dismissal rate | Boundary % | Dot % |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal | 65,212 | 94,780 | 145.34 | 5.13% | 20.31% | 36.78% |
| Moderate | 70,618 | 97,221 | 137.67 | 4.99% | 18.84% | 37.94% |
| High | 38,013 | 51,435 | 135.31 | 6.21% | 16.18% | 34.39% |
| Extreme | 12,672 | 17,646 | 139.25 | 9.77% | 18.56% | 40.46% |

*Balls exclude wides and penalties. Dismissal rate is batter outs per ball faced; Retire Out is excluded.*

**Table 8. Bowling outcomes by pressure band.**

| Band | Legal balls | Runs | Economy | Wicket rate | Boundary % | Dot % |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal | 58,297 | 78,500 | 8.08 | 4.87% | 17.21% | 39.17% |
| Moderate | 71,099 | 98,687 | 8.33 | 4.75% | 18.48% | 39.12% |
| High | 42,931 | 68,862 | 9.62 | 5.86% | 20.66% | 31.68% |
| Extreme | 13,623 | 23,153 | 10.20 | 8.57% | 22.10% | 32.89% |

*Runs are charged to the bowler. Wicket rate is bowler-credited wickets per legal ball.*

![Figure 3. Pressure bands separate batting dismissals and bowling economy. The Moderate band sits close to Normal, which is why it is excluded from both the pressure sample and the baseline.](pressure_outcome_separation.png)

*Figure 3. Pressure bands separate batting dismissals and bowling economy. The Moderate band sits close to Normal, which is why it is excluded from both the pressure sample and the baseline.*

The batting gradient is clear at the top but not perfectly monotonic. The dismissal rate is **5.13% on Normal balls, 6.21% on High and 9.77% on Extreme** — an 90% relative increase from Normal to Extreme. Strike rate falls from 145.3 to 135.3 in the High band, but rises slightly to 139.3 in Extreme. That is plausible: Extreme situations are often chases in which the batting side must attack, so the scoring rate can recover even as the risk of dismissal rises sharply. The model does not require strike rate to fall monotonically; it requires the situation to be harder, and a near-doubling of the dismissal rate is direct evidence of that.

The bowling gradient is monotonic and large. Economy rises from **8.08 to 9.62 to 10.20** per over across Normal, High and Extreme, and the wicket rate rises from **4.87% to 5.86% to 8.57%**. Extreme pressure balls cost 2.1 more runs per over and produce 76% more wickets per ball than Normal balls. Boundary rate rises and dot rate falls, exactly as a harder bowling environment should behave.

## 6.1 Pressure is not just the death overs

**Table 9. Pressure versus Normal outcomes within each phase.**

| Phase | Bat SR Normal | Bat SR Pressure | Bat out % Normal | Bat out % Pressure | Bowl econ Normal | Bowl econ Pressure | Bowl wkt % Normal | Bowl wkt % Pressure |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Powerplay | 137.2 | 113.0 | 4.71% | 4.21% | 7.95 | 8.68 | 4.40% | 4.56% |
| Middle | 141.7 | 125.8 | 4.58% | 5.35% | 7.40 | 9.04 | 4.38% | 5.33% |
| Death | 176.9 | 149.7 | 7.63% | 9.20% | 8.86 | 9.96 | 7.07% | 8.28% |

*Pressure means High + Extreme. This check ensures the index is not simply a proxy for the 16th–20th overs.*

![Figure 4. Pressure batting strike rate and pressure bowling economy within each phase.](pressure_by_phase.png)

*Figure 4. Pressure batting strike rate and pressure bowling economy within each phase.*

Within every phase, pressure batting produces a lower strike rate than normal batting, and pressure bowling produces a higher economy. The dismissal-rate effect is concentrated in the middle and death overs (5.35% vs 4.58%, and 9.20% vs 7.63%); in the powerplay it is essentially flat (4.21% vs 4.71%). That is a useful boundary on the claim: the index is not universally associated with higher wicket risk, but it is associated with harder scoring in all phases and with higher wicket risk when the innings is advanced. The index therefore adds information beyond 'it was the 19th over'.

## 6.2 Component behaviour

The batting score is dominated by task difficulty (correlation 0.93 with the total). Resource adds context (0.57) and phase adds a little (0.36). Closeness is almost uncorrelated with the others (0.00), so it contributes genuinely independent information even though its weight is small. For bowling, threat dominates (0.88), while closeness (0.41) and phase (0.24) add separate signal. The bowling resource term is almost orthogonal to the total (−0.11) and is kept at 5% for interpretability; it is the weakest component in the model and is disclosed as such.

The validation supports the definition, with two honest caveats. First, the Extreme batting band is not a pure 'slow scoring' band; it is a high-risk band. Second, the powerplay dismissal rate does not rise under pressure. Both facts are consistent with the cricket and are preferable to a definition engineered to produce a perfect gradient.

---

# 7. From pressure to player performance

Each player has two samples. The **pressure sample** contains every delivery charged to them in the High or Extreme band. The **normal sample** contains every delivery in the Normal band. Moderate deliveries are excluded from both. A pressure innings is counted only if it contains at least three pressure balls faced (batting) or six pressure legal balls bowled (bowling); this prevents a single ball from creating an innings.

**Table 10. Performance metrics collected for both roles.**

| Metric | Batting | Bowling |
| :--- | :--- | :--- |
| Scoring | Runs off the bat per 100 balls (strike rate). | Runs conceded per over (economy). |
| Conversion | Runs per dismissal (average). | Runs conceded per wicket (average). |
| Wicket-taking | Dismissals per ball faced. | Bowler-credited wickets per legal ball; balls per wicket. |
| Boundary | Fours and sixes as a share of balls faced. | Boundaries conceded as a share of legal balls. |
| Control | Dot balls as a share of balls faced. | Dot balls as a share of legal balls. |
| Above par | Runs above the format's expected runs on the same balls. | Runs saved against the format's expected runs on the same balls. |
| Consistency | Share of pressure innings with positive runs above par; share of seasons above par. | Share of pressure innings with positive runs saved; share of seasons above par. |
| Context | Chase runs added per ball; performance after a recent wicket. | Defence runs saved per ball; performance after a recent wicket. |

*All rates use the cricket-correct denominators from Section 3.*

**Lift and its sign convention.** Lift is the difference between pressure and normal performance. The direction is chosen so that a positive number always means 'better under pressure':

- **Batting strike-rate lift** = pressure SR − normal SR. Positive means the batter scored faster under pressure.
- **Batting average lift** = pressure average − normal average. Positive means the batter converted better under pressure.
- **Bowling economy lift** = normal economy − pressure economy. Positive means the bowler conceded *fewer* runs per over under pressure. A negative number means the economy worsened.
- **Bowling wicket-rate lift** = pressure wicket rate − normal wicket rate. Positive means more wickets per ball under pressure.

The bowling sign convention is easy to misread, so the tables label the column **Econ Δ (N−P)** and the dashboard labels it **Economy improvement**. In the final top 10, every selected bowler has a negative economy lift: all of them conceded more per over under pressure than in normal cricket. That is not a flaw in the selection. It is the global pressure effect documented in Section 6: pressure bowling is harder for everyone. The score compares each bowler with the player population, not with a zero-lift ideal, so what matters is how much better or worse they are than their peers once the global effect is removed.

**Consistency** is measured in two ways and combined. The positive-innings rate is the share of a player's pressure innings in which they beat the format expectation. Season consistency is the share of their seasons in which they beat expectation. Both are smoothed: `(positive innings + 4) / (innings + 8)` and `(positive seasons + 1) / (seasons + 2)`, with a single-season player set to the neutral value 0.5. The combined index is 70% innings and 30% seasons. This stops three good innings, or one good tournament, from producing a perfect consistency score.

The model does not use total career runs or total career wickets as ranking inputs. Volume enters only through the eligibility rule and a small confidence multiplier. A player with 5,000 runs at an ordinary pressure strike rate will not outrank a player with 450 pressure balls at an exceptional one. That is deliberate: the brief asks who performs when it matters, not who has played the most cricket.

---

# 8. Fair comparison across samples and competitions

Three problems make a naive pressure ranking unfair. Players face different numbers of pressure balls; IPL and T20I are different scoring environments; and a player's normal sample may be much smaller than their pressure sample. Each problem has an explicit treatment.

## 8.1 Two formats, two baselines

Every rate is expressed against the baseline of the format in which the delivery was bowled. This prevents the higher-scoring IPL environment from inflating an IPL player relative to a T20I player, and it prevents a low-scoring T20I career from being penalised for its environment.

**Table 11. Format-level baselines used throughout the model.**

| Format | Matches | Deliveries | Runs / over | Bat SR | Bat average | Boundary % | Dot % |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| IPL (T20) | 367 | 87,673 | 9.21 | 146.89 | 27.77 | 20.42% | 35.39% |
| T20I | 470 | 106,315 | 8.44 | 134.30 | 22.83 | 17.56% | 38.25% |

*These are descriptive format baselines, fixed for the whole data window. They are not season averages and do not use future matches.*

The difference is material: IPL scoring is 9.21 runs per over against 8.44 in T20I, and the IPL batting strike rate is 146.9 against 134.3. A player who splits time between the two is not compared with a single blended average; each ball is compared with its own format's par.

## 8.2 Empirical-Bayes shrinkage

A player with 40 pressure balls can post an extreme strike rate by chance. Raw rates are therefore shrunk toward the format baseline before they enter the score:

```
rate_EB = (successes + k * baseline_rate) / (trials + k)
```

The prior strength `k` is measured in balls. A 200-ball player keeps about 45% of the weight on their own data; a 500-ball player keeps about 68%. The prior is the **format-level** baseline for the ball, not the player's own average and not the current season's average, so there is no leakage from future matches.

**Table 12. Empirical-Bayes prior strengths.**

| Parameter | Prior strength k (balls) |
| :--- | ---: |
| Batting runs | 240 |
| Batting dismissals | 300 |
| Batting boundaries | 300 |
| Batting dots | 300 |
| Bowling runs | 240 |
| Bowling wickets | 300 |
| Bowling dots | 300 |
| Bowling boundaries | 300 |
| Lift | 300 |

*These values were fixed before the final rankings and are not tuned to the selected players.*

## 8.3 Standardisation

Each component is converted to a robust z-score across the player population:

```
z = clip((x - median(x_ref)) / (1.4826 * MAD(x_ref)), -3, +3)
```

`x_ref` is the set of players with at least 60 pressure balls. Median and median absolute deviation are used instead of mean and standard deviation because a few extreme players would otherwise compress everyone else. Clipping at ±3 stops a single outlier from dominating the composite. Because every player is standardised against the same population median, the global rise in scoring under pressure does not mechanically penalise every bowler; what matters is relative performance.

## 8.4 Eligibility

**Table 13. Eligibility rules and resulting population.**

| Class | Batting | Bowling | Count |
| :--- | :--- | :--- | :---: |
| Fully Eligible | ≥200 pressure balls, ≥12 pressure innings, ≥10 matches | ≥300 pressure legal balls, ≥15 pressure innings, ≥10 matches | 67 bat / 52 bowl |
| Limited Sample | ≥100 balls, ≥6 innings (not full) | ≥150 balls, ≥8 innings (not full) | 82 bat / 75 bowl |
| Insufficient Evidence | Below the Limited thresholds | Below the Limited thresholds | 675 bat / 469 bowl |

*Only Fully Eligible players receive a final rank. Limited and Insufficient players stay in the full rankings for transparency.*

The final top 10 is restricted to Fully Eligible players, and ranks are recomputed 1–10 among that group. The rule is strict on purpose: a 100-ball pressure record is not enough to justify a national selection claim, and a 40-ball record is anecdote. The thresholds were fixed before the top 10 was inspected and are tested at stricter and more relaxed levels in Section 14.

## 8.5 The normal-sample imbalance

Pressure and normal samples are not the same size, and for some players the normal sample is thin. The lift component is therefore shrunk by both sample sizes:

```
lift_shrink = (pressure_balls / (pressure_balls + 200)) * sqrt(normal_balls / (normal_balls + 200))
```

A player with 30 pressure balls and 1,000 normal balls cannot claim a huge lift, and neither can a player with 250 pressure balls and 23 normal balls. The table shows the raw sample sizes behind every selected player so the reader can judge how much weight the lift deserves.

**Table 14. Pressure and normal sample sizes for the twenty selected players.**

| Role | Player | Pressure balls | Normal balls | Pressure share |
| :--- | :--- | ---: | ---: | ---: |
| Batter | Tim David | 445 | 431 | 50.8% |
| Batter | Mark Chapman | 295 | 227 | 56.5% |
| Batter | Suryakumar Yadav | 504 | 1,150 | 30.5% |
| Batter | Ashutosh Sharma | 248 | 23 | 91.5% |
| Batter | Rovman Powell | 726 | 374 | 66.0% |
| Batter | David Miller | 660 | 264 | 71.4% |
| Batter | Dinesh Karthik | 358 | 100 | 78.2% |
| Batter | Ayush Badoni | 465 | 143 | 76.5% |
| Batter | Namboori Tilak Varma | 712 | 903 | 44.1% |
| Batter | Dhruv Jurel | 257 | 275 | 48.3% |
| Bowler | Matheesha Pathirana | 529 | 357 | 59.7% |
| Bowler | Sunil Narine | 466 | 528 | 46.9% |
| Bowler | Ravichandran Ashwin | 379 | 385 | 49.6% |
| Bowler | Rashid Khan | 819 | 1,040 | 44.1% |
| Bowler | Haris Rauf | 380 | 237 | 61.6% |
| Bowler | Jasprit Bumrah | 504 | 538 | 48.4% |
| Bowler | Mohammed Siraj | 451 | 488 | 48.0% |
| Bowler | Yuzvendra Chahal | 804 | 573 | 58.4% |
| Bowler | Josh Hazlewood | 443 | 460 | 49.1% |
| Bowler | Noor Ahmad | 554 | 471 | 54.0% |

*A high pressure share means the player's lift rests on a comparatively thin normal baseline. Ashutosh Sharma (23 normal balls) is the clearest example.*

The imbalance is real and cannot be wished away. It is handled in three ways: the lift is shrunk toward zero; the absolute pressure level carries most of the batting and bowling weight (84% of the batting score and 72% of the bowling score before lift and consistency); and the bootstrap interval shows how much the score moves when the sample is resampled. Ashutosh Sharma is the most important test case: his +51 strike-rate lift is built on 23 normal balls and is heavily shrunk, so his rank is driven by his pressure output, not by the headline lift.

---

# 9. The Reliability Score

The Reliability Score is a weighted composite of standardised components, passed through a confidence adjustment and mapped to a 0–100 index. It is a **relative index**, not a probability that a player will perform well in a future match. A score of 90 means the player's composite is in the top decile of the modelled population; it does not mean '90% reliable'.

**Table 15. Component weights for the two roles.**

| Batting component | Weight | Bowling component | Weight |
| :--- | ---: | :--- | ---: |
| Strike rate (format-relative) | 30% | Economy (format-relative) | 32% |
| Average (format-relative) | 22% | Wicket rate | 24% |
| Boundary rate | 8% | Dot-ball rate | 10% |
| Pressure lift | 20% | Boundary prevention | 6% |
| Consistency | 15% | Pressure lift | 15% |
| Chase performance | 5% | Consistency | 10% |
| — | — | Defence record | 3% |

*Weights are fixed. Section 14 tests output-heavy, lift-heavy, economy-heavy and wicket-heavy alternatives.*

**What each component measures.**

- **Strike rate / economy** compare the player's shrunk pressure rate with the format par for the same balls. This is the largest weight in both roles because it is the most direct measure of pressure output.
- **Average** rewards conversion: runs per dismissal in batting, runs per wicket in bowling. It stops a high strike rate with a wicket every eight balls from dominating.
- **Boundary rate / boundary prevention** capture the extreme-event side of the game. The weights are small because boundaries are noisy and correlated with strike rate and economy.
- **Pressure lift** is 60% scoring lift and 40% conversion lift, after shrinkage. It rewards players who raise their level, not merely players who are good in absolute terms.
- **Consistency** rewards repeated positive innings and seasons rather than one outlier.
- **Chase performance** (batting) rewards runs above par in successful chases. **Defence record** (bowling) rewards runs saved when defending. Both are small context terms, not the core of the score.

The composite and score are:

```
composite  = sum(weight_i * z_i) / sum(weight_i)
confidence = 0.85 + 0.15 * min(1, sqrt(pressure_balls / 400))     # batting
confidence = 0.85 + 0.15 * min(1, sqrt(pressure_balls / 500))     # bowling
score      = 100 * Phi(composite * confidence)
```

The confidence multiplier gives a small penalty to players near the eligibility boundary. It is deliberately narrow (0.85–1.00) so that it cannot reorder well-sampled players. `Phi` is the standard normal cumulative distribution, which maps the composite to a 0–100 scale with a known reference distribution.

## 9.1 Component contributions of the selected players

**Table 16. Batting component contributions (z × weight) for the final top 10.**

| Batter | SR | Avg | Bdry | Lift | Cons | Chase | Composite | Score |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Tim David | +0.90 | +0.46 | +0.23 | -0.21 | +0.37 | +0.15 | +1.90 | 97.10 |
| Mark Chapman | +0.59 | +0.52 | +0.16 | +0.20 | +0.25 | +0.15 | +1.87 | 96.59 |
| Suryakumar Yadav | +0.82 | +0.60 | +0.24 | -0.27 | +0.25 | +0.15 | +1.79 | 96.35 |
| Ashutosh Sharma | +0.70 | +0.26 | +0.22 | +0.23 | +0.27 | +0.15 | +1.83 | 96.19 |
| Rovman Powell | +0.48 | +0.36 | +0.13 | +0.25 | +0.19 | +0.15 | +1.56 | 94.12 |
| David Miller | +0.46 | +0.45 | +0.09 | +0.20 | +0.18 | +0.15 | +1.53 | 93.74 |
| Dinesh Karthik | +0.61 | +0.26 | +0.18 | +0.08 | +0.21 | +0.15 | +1.49 | 93.13 |
| Ayush Badoni | +0.18 | +0.29 | -0.00 | +0.54 | +0.15 | +0.15 | +1.31 | 90.29 |
| Namboori Tilak Varma | +0.41 | +0.55 | +0.05 | -0.01 | +0.09 | +0.15 | +1.24 | 89.35 |
| Dhruv Jurel | +0.52 | +0.17 | +0.17 | -0.02 | +0.24 | +0.14 | +1.22 | 88.41 |

*The row sum is the composite before the confidence adjustment. A positive value means the component helped the player's score.*

**Table 17. Bowling component contributions (z × weight) for the final top 10.**

| Bowler | Econ | Wkt | Dot | Bdry | Lift | Cons | Def | Composite | Score |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Matheesha Pathirana | +0.40 | +0.68 | +0.19 | +0.10 | +0.08 | +0.12 | +0.03 | +1.60 | 94.40 |
| Sunil Narine | +0.96 | -0.13 | +0.21 | +0.18 | -0.06 | +0.23 | +0.07 | +1.46 | 92.58 |
| Ravichandran Ashwin | +0.76 | +0.07 | -0.00 | +0.18 | +0.15 | +0.14 | +0.08 | +1.38 | 91.13 |
| Rashid Khan | +0.38 | +0.42 | -0.04 | +0.10 | -0.01 | +0.15 | +0.04 | +1.04 | 84.90 |
| Haris Rauf | +0.01 | +0.57 | +0.18 | +0.01 | +0.21 | +0.04 | -0.03 | +0.99 | 83.33 |
| Jasprit Bumrah | +0.68 | -0.12 | +0.04 | +0.13 | -0.05 | +0.19 | +0.05 | +0.92 | 82.22 |
| Mohammed Siraj | +0.03 | +0.43 | +0.23 | -0.03 | +0.13 | +0.02 | +0.03 | +0.84 | 79.66 |
| Yuzvendra Chahal | +0.30 | +0.26 | -0.20 | +0.13 | +0.20 | +0.08 | +0.04 | +0.81 | 79.43 |
| Josh Hazlewood | +0.16 | +0.33 | +0.26 | -0.03 | -0.06 | +0.05 | +0.02 | +0.73 | 76.65 |
| Noor Ahmad | +0.38 | +0.21 | +0.05 | +0.11 | -0.12 | +0.07 | +0.03 | +0.73 | 76.60 |

*The row sum is the composite before the confidence adjustment.*

The contributions make the rankings auditable. For example, Tim David's score is driven by strike rate and average with a roughly neutral lift, while Mark Chapman's is driven by a large positive lift. Matheesha Pathirana's bowling score is driven by wicket rate and economy rather than by economy lift, which is slightly negative. Different profiles can reach the same score by different routes, and the table shows which route each player took.

## 9.2 Ranking rule

1. Filter to Fully Eligible players only.
2. Sort by Reliability Score descending.
3. Assign ranks 1–N with ties sharing the better rank (method = 'min').
4. Take the first 10 for the submission list.

No manual reordering is applied. The CSV, the report and the dashboard all read the same scored tables. If the model produces a surprising name, the name stays and the evidence is reported.

---

# 10. Final batting top 10

The final batting list is below. The table reports the pressure sample, the player's own normal comparison, the raw lift, consistency and the final score. Format coverage is shown because a single-format record is weaker evidence than a two-format record, even when the score is the same.

**Table 18. Final top 10 batters, ranked by Reliability Score.**

| Rank | Player | Team | Balls | SR | Avg | SR lift | Avg lift | Cons. | Score | Formats |
| :---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1 | Tim David | Mumbai Indians | 445 | 178.9 | 34.6 | -1.4 | +4.7 | 0.74 | 97.10 | T20; T20I |
| 2 | Mark Chapman | New Zealand | 295 | 161.0 | 36.5 | +19.2 | +13.5 | 0.65 | 96.59 | T20I |
| 3 | Suryakumar Yadav | Mumbai Indians | 504 | 173.8 | 38.1 | -0.6 | +2.3 | 0.65 | 96.35 | T20; T20I |
| 4 | Ashutosh Sharma | Delhi Capitals | 248 | 181.4 | 32.1 | +51.0 | +24.6 | 0.66 | 96.19 | T20 |
| 5 | Rovman Powell | West Indies | 726 | 153.6 | 29.3 | +9.2 | +7.7 | 0.61 | 94.12 | T20; T20I |
| 6 | David Miller | Gujarat Titans | 660 | 158.3 | 33.7 | +13.6 | +1.9 | 0.60 | 93.74 | T20; T20I |
| 7 | Dinesh Karthik | Royal Challengers Bengaluru | 358 | 169.3 | 30.3 | +10.3 | +14.4 | 0.62 | 93.13 | T20; T20I |
| 8 | Ayush Badoni | Lucknow Super Giants | 465 | 153.1 | 32.4 | +30.7 | +17.8 | 0.57 | 90.29 | T20 |
| 9 | Namboori Tilak Varma | Mumbai Indians | 712 | 155.9 | 35.8 | +14.3 | -6.8 | 0.54 | 89.35 | T20; T20I |
| 10 | Dhruv Jurel | Rajasthan Royals | 257 | 172.0 | 29.5 | +22.2 | -8.0 | 0.64 | 88.41 | T20; T20I |

*Balls are pressure balls (High + Extreme). SR lift = pressure SR − normal SR; avg lift = pressure average − normal average. Positive is better.*

![Figure 5. Final top 10 batters: locked Reliability Score (bar) with 1,000-resample bootstrap median and 95% interval (dot and whiskers).](final_top10_batters.png)

*Figure 5. Final top 10 batters: locked Reliability Score (bar) with 1,000-resample bootstrap median and 95% interval (dot and whiskers).*

## 10.1 Why Tim David ranks first

Tim David combines the highest pressure strike rate among the leading candidates with a strong conversion record and the best consistency in the top five. Across **445 pressure balls in 33 innings**, he scored **796 runs at 178.9**, with a **34.6 average**, 24.3% boundaries and 29.7% dots. His normal strike rate is almost identical (180.3), so his case does not rest on a pressure uplift; it rests on sustaining an elite scoring rate in the hardest situations while his average rises by 4.7. Seventy-three per cent of his pressure innings were positive, and he has pressure evidence in both IPL and T20I across five seasons. That combination of level, volume and consistency is why he leads the list.

The margin is not large. Mark Chapman is 0.5 points behind and Suryakumar Yadav is 0.75 behind. A different weighting of absolute output versus lift can put Suryakumar first (Section 14). The claim is therefore 'highest rated under the locked model', not 'unambiguously the best batter in the world'.

## 10.2 Player evidence

### 1. Tim David — Mumbai Indians — score 97.10

**Sample.** 445 pressure balls in 33 innings across 98 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 431 balls.

**Pressure versus normal.** In pressure he scored 796 runs at **178.9** with a **34.6 average**, 24.3% boundaries and 29.7% dots. In normal cricket he scored at 180.3 with a 29.9 average. Raw lift: **-1.4 strike rate** and **+4.7 average**. Consistency is 0.74; 73% of his pressure innings beat par.

**Why he is selected.** The highest-pressure run-scorer in the pool, with an elite strike rate that does not fall under pressure. His average rises by 4.7 and 73% of his pressure innings beat par. He is the only batter in the top five with a consistency score above 0.70.

**What could go wrong.** The top-10 probability is 0.74 — the highest in the list, but still a one-in-four chance of falling out under resampling. Ranks 1–4 are separated by less than one point, so the order at the top is not statistically firm. Bootstrap 95% interval: score 66.0–99.4, rank 1–29, top-10 probability 0.74.

**Pressure innings examples.** 50 off 26 vs Punjab Kings (2025-04-18, T20, pressure 72.8); 46 off 18 vs Sunrisers Hyderabad (2022-05-17, T20, pressure 69.9).

### 2. Mark Chapman — New Zealand — score 96.59

**Sample.** 295 pressure balls in 21 innings across 53 matches (T20I; 2022/23; 2023; 2024; 2024/25; 2025; 2026). His normal comparison uses 227 balls.

**Pressure versus normal.** In pressure he scored 475 runs at **161.0** with a **36.5 average**, 21.0% boundaries and 26.4% dots. In normal cricket he scored at 141.8 with a 23.0 average. Raw lift: **+19.2 strike rate** and **+13.5 average**. Consistency is 0.65; 71% of his pressure innings beat par.

**Why he is selected.** The strongest genuine lift in the top three: +19.2 strike rate and +13.5 average over his own normal, with 71% positive pressure innings. He converts pressure starts into bigger scores rather than simply scoring faster.

**What could go wrong.** The sample is entirely T20I and only 15 balls are Extreme, so this is a strong High-band record rather than a proven Extreme one. A format-split view is less supportive. Bootstrap 95% interval: score 65.6–99.4, rank 1–31, top-10 probability 0.70.

**Pressure innings examples.** 80 off 37 vs Pakistan (2023-04-24, T20I, pressure 61.8); 59 off 41 vs United Arab Emirates (2023-08-19, T20I, pressure 65.8).

### 3. Suryakumar Yadav — Mumbai Indians — score 96.35

**Sample.** 504 pressure balls in 30 innings across 139 matches (T20; T20I; 2022; 2022/23; 2023; 2024; 2025; 2026). His normal comparison uses 1150 balls.

**Pressure versus normal.** In pressure he scored 876 runs at **173.8** with a **38.1 average**, 25.2% boundaries and 27.4% dots. In normal cricket he scored at 174.4 with a 35.8 average. Raw lift: **-0.6 strike rate** and **+2.3 average**. Consistency is 0.65; 63% of his pressure innings beat par.

**Why he is selected.** Sustains an exceptional 173.8 strike rate and 38.1 average across 504 pressure balls in both formats, with 25.2% boundaries. His lift is flat because his normal level is already elite; he is selected on absolute performance, not improvement.

**What could go wrong.** The average lift is only +2.3, so his position depends on how much weight is given to absolute output. He ranks first under an output-heavy weighting and third under the locked one. Bootstrap 95% interval: score 66.5–99.1, rank 1–29, top-10 probability 0.69.

**Pressure innings examples.** 109 off 43 vs England (2022-07-10, T20I, pressure 65.3); 68 off 37 vs Royal Challengers Bengaluru (2022-04-09, T20, pressure 67.9).

### 4. Ashutosh Sharma — Delhi Capitals — score 96.19

**Sample.** 248 pressure balls in 20 innings across 26 matches (T20; 2024; 2025; 2026). His normal comparison uses 23 balls.

**Pressure versus normal.** In pressure he scored 450 runs at **181.4** with a **32.1 average**, 26.2% boundaries and 31.1% dots. In normal cricket he scored at 130.4 with a 7.5 average. Raw lift: **+51.0 strike rate** and **+24.6 average**. Consistency is 0.66; 65% of his pressure innings beat par.

**Why he is selected.** The most extreme pressure profile in the pool: 181.5 strike rate and 26.2% boundaries across 248 balls, including 87 Extreme balls. He scores faster in pressure than almost anyone and does it in the death overs (156 of 248 balls).

**What could go wrong.** His +51 strike-rate lift rests on only 23 normal balls and is heavily shrunk. The selection is justified by the pressure output, not by the lift. The normal-sample imbalance is the main reason his interval is wide. Bootstrap 95% interval: score 69.9–99.2, rank 1–25, top-10 probability 0.68.

**Pressure innings examples.** 66 off 31 vs Lucknow Super Giants (2025-03-24, T20, pressure 67.0); 43 off 16 vs Mumbai Indians (2024-04-18, T20, pressure 60.9).

### 5. Rovman Powell — West Indies — score 94.12

**Sample.** 726 pressure balls in 48 innings across 100 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 374 balls.

**Pressure versus normal.** In pressure he scored 1115 runs at **153.6** with a **29.3 average**, 20.0% boundaries and 35.3% dots. In normal cricket he scored at 144.4 with a 21.6 average. Raw lift: **+9.2 strike rate** and **+7.7 average**. Consistency is 0.61; 50% of his pressure innings beat par.

**Why he is selected.** Volume and durability: 726 pressure balls across 48 innings, 153.6 strike rate and 29.3 average, with positive lift in both strike rate (+9.2) and average (+7.7). He has the second-largest pressure sample in the list.

**What could go wrong.** Three-quarters of his pressure balls are T20I, and his consistency score (0.61) is mid-pack. The top-10 probability is 0.51, so his place is a coin flip under resampling. Bootstrap 95% interval: score 54.5–98.8, rank 1–40, top-10 probability 0.51.

**Pressure innings examples.** 78 off 44 vs England (2025-06-10, T20I, pressure 70.1); 62 off 30 vs India (2022-02-18, T20I, pressure 65.6).

### 6. David Miller — Gujarat Titans — score 93.74

**Sample.** 660 pressure balls in 46 innings across 81 matches (T20; T20I; 2022; 2022/23; 2023; 2024; 2025; 2026). His normal comparison uses 264 balls.

**Pressure versus normal.** In pressure he scored 1045 runs at **158.3** with a **33.7 average**, 20.3% boundaries and 28.3% dots. In normal cricket he scored at 144.7 with a 31.8 average. Raw lift: **+13.6 strike rate** and **+1.9 average**. Consistency is 0.60; 54% of his pressure innings beat par.

**Why he is selected.** A high-volume middle-order record: 660 balls, 158.3 strike rate, 33.7 average and +13.6 strike-rate lift. He has pressure evidence in both formats across six seasons.

**What could go wrong.** The average lift is small (+1.9), so the case is scoring rate and volume rather than improved conversion. His top-10 probability is 0.51. Bootstrap 95% interval: score 47.8–99.2, rank 1–45, top-10 probability 0.51.

**Pressure innings examples.** 106 off 47 vs India (2022-10-02, T20I, pressure 66.1); 63 off 28 vs India (2022-06-09, T20I, pressure 63.4).

### 7. Dinesh Karthik — Royal Challengers Bengaluru — score 93.13

**Sample.** 358 pressure balls in 30 innings across 61 matches (T20; T20I; 2022; 2022/23; 2023; 2024). His normal comparison uses 100 balls.

**Pressure versus normal.** In pressure he scored 606 runs at **169.3** with a **30.3 average**, 23.5% boundaries and 29.1% dots. In normal cricket he scored at 159.0 with a 15.9 average. Raw lift: **+10.3 strike rate** and **+14.4 average**. Consistency is 0.62; 53% of his pressure innings beat par.

**Why he is selected.** A specialist finisher profile: 169.3 strike rate and 30.3 average in pressure, with +10.3 strike-rate and +14.4 average lift. He was consistently positive in pressure innings (53%).

**What could go wrong.** His normal sample is only 100 balls and his career window ends in 2024, so the record is older and the baseline is thin. The top-10 probability is 0.49. Bootstrap 95% interval: score 47.6–99.1, rank 1–46, top-10 probability 0.49.

**Pressure innings examples.** 83 off 35 vs Sunrisers Hyderabad (2024-04-15, T20, pressure 70.7); 59 off 29 vs Delhi Capitals (2022-04-16, T20, pressure 63.1).

### 8. Ayush Badoni — Lucknow Super Giants — score 90.29

**Sample.** 465 pressure balls in 29 innings across 56 matches (T20; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 143 balls.

**Pressure versus normal.** In pressure he scored 712 runs at **153.1** with a **32.4 average**, 19.1% boundaries and 29.2% dots. In normal cricket he scored at 122.4 with a 14.6 average. Raw lift: **+30.7 strike rate** and **+17.8 average**. Consistency is 0.57; 52% of his pressure innings beat par.

**Why he is selected.** A strong pressure-versus-normal contrast: +30.7 strike rate and +17.8 average on 465 IPL-only balls. He converts pressure starts unusually well for a middle-order batter.

**What could go wrong.** The absolute pressure strike rate (153.1) is good but not elite, and the ranking is driven by the lift. He is IPL-only and has the lowest top-10 probability in the list (0.33). Bootstrap 95% interval: score 55.4–96.5, rank 3–39, top-10 probability 0.33.

**Pressure innings examples.** 73 off 37 vs Punjab Kings (2025-05-04, T20, pressure 67.5); 59 off 33 vs Chennai Super Kings (2023-05-03, T20, pressure 68.5).

### 9. Namboori Tilak Varma — Mumbai Indians — score 89.35

**Sample.** 712 pressure balls in 42 innings across 123 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 903 balls.

**Pressure versus normal.** In pressure he scored 1110 runs at **155.9** with a **35.8 average**, 19.5% boundaries and 30.3% dots. In normal cricket he scored at 141.6 with a 42.6 average. Raw lift: **+14.3 strike rate** and **-6.8 average**. Consistency is 0.54; 45% of his pressure innings beat par.

**Why he is selected.** A volume-based selection: 712 pressure balls across both formats, 155.9 strike rate and 35.8 average. His strike rate improves by 14.3 under pressure, and he has the second-largest pressure sample among the batters.

**What could go wrong.** His average falls by 6.8 relative to a very high normal average (42.6), so he is not improving conversion. Consistency is 0.54 and the top-10 probability is 0.38. Bootstrap 95% interval: score 45.4–98.5, rank 1–48, top-10 probability 0.38.

**Pressure innings examples.** 84 off 46 vs Royal Challengers Bengaluru (2023-04-02, T20, pressure 65.4); 61 off 30 vs Delhi Capitals (2024-04-27, T20, pressure 67.0).

### 10. Dhruv Jurel — Rajasthan Royals — score 88.41

**Sample.** 257 pressure balls in 16 innings across 54 matches (T20; T20I; 2023; 2024; 2025; 2026). His normal comparison uses 275 balls.

**Pressure versus normal.** In pressure he scored 442 runs at **172.0** with a **29.5 average**, 24.5% boundaries and 28.4% dots. In normal cricket he scored at 149.8 with a 37.5 average. Raw lift: **+22.2 strike rate** and **-8.0 average**. Consistency is 0.64; 69% of his pressure innings beat par.

**Why he is selected.** A high-strike-rate, lower-volume case: 172.0 strike rate and 24.5% boundaries in 257 pressure balls, with +22.2 strike-rate lift and 69% positive pressure innings. He is the only Rajasthan Royals batter in the list.

**What could go wrong.** His average falls by 8.0, so he is a scoring-rate pick rather than a conversion pick. Only 16 pressure innings clear the counting rule, and his T20I evidence is four balls; the top-10 probability is 0.36. Bootstrap 95% interval: score 46.9–98.4, rank 1–42, top-10 probability 0.36.

**Pressure innings examples.** 70 off 35 vs Sunrisers Hyderabad (2025-03-23, T20, pressure 63.0); 53 off 31 vs Punjab Kings (2025-05-18, T20, pressure 64.7).

![Figure 6. Component contributions for the final top 10 batters. The heatmap makes clear that different players reach the list by different routes.](component_heatmap_batters.png)

*Figure 6. Component contributions for the final top 10 batters. The heatmap makes clear that different players reach the list by different routes.*

The batting list is dominated by middle-order and finisher profiles. That is not an artefact of a death-over bias: 84% of the batting score comes from absolute pressure output, conversion, boundaries and lift, and only 16% from phase-related and context terms. The list reflects the fact that pressure batting is concentrated in the middle and death overs, where the task is hardest and the sample is largest.

---

# 11. Final bowling top 10

The bowling list is built the same way, with its own weights and its own eligibility rule. The most important reading note is the sign of the economy lift: every selected bowler has a negative number, meaning every one of them conceded more per over under pressure than in normal cricket. The ranking is about who coped best relative to the player population, not who improved on an impossible baseline.

**Table 19. Final top 10 bowlers, ranked by Reliability Score.**

| Rank | Player | Team | Balls | Wkts | Econ | Avg | SR | Econ Δ | Cons. | Score | Formats |
| :---: | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 1 | Matheesha Pathirana | Chennai Super Kings | 529 | 48 | 8.73 | 16.0 | 11.0 | -0.51 | 0.57 | 94.40 | T20; T20I |
| 2 | Sunil Narine | Kolkata Knight Riders | 466 | 24 | 7.44 | 24.1 | 19.4 | -1.09 | 0.70 | 92.58 | T20 |
| 3 | Ravichandran Ashwin | Rajasthan Royals | 379 | 24 | 7.76 | 20.4 | 15.8 | -0.32 | 0.59 | 91.13 | T20; T20I |
| 4 | Rashid Khan | Gujarat Titans | 819 | 62 | 8.68 | 19.1 | 13.2 | -1.50 | 0.60 | 84.90 | T20; T20I |
| 5 | Haris Rauf | Pakistan | 380 | 36 | 9.11 | 16.0 | 10.6 | -0.60 | 0.46 | 83.33 | T20I |
| 6 | Jasprit Bumrah | Mumbai Indians | 504 | 27 | 8.00 | 24.9 | 18.7 | -1.17 | 0.65 | 82.22 | T20; T20I |
| 7 | Mohammed Siraj | Royal Challengers Bengaluru | 451 | 36 | 9.70 | 20.2 | 12.5 | -1.13 | 0.44 | 79.66 | T20; T20I |
| 8 | Yuzvendra Chahal | Rajasthan Royals | 804 | 55 | 8.97 | 21.9 | 14.6 | -0.31 | 0.52 | 79.43 | T20; T20I |
| 9 | Josh Hazlewood | Royal Challengers Bengaluru | 443 | 34 | 9.14 | 19.9 | 13.0 | -1.17 | 0.48 | 76.65 | T20; T20I |
| 10 | Noor Ahmad | Chennai Super Kings | 554 | 38 | 8.74 | 21.2 | 14.6 | -1.99 | 0.50 | 76.60 | T20; T20I |

*Balls are pressure legal balls. Econ Δ = normal economy − pressure economy; a negative value means the economy worsened under pressure.*

![Figure 7. Final top 10 bowlers: locked Reliability Score (bar) with 1,000-resample bootstrap median and 95% interval (dot and whiskers).](final_top10_bowlers.png)

*Figure 7. Final top 10 bowlers: locked Reliability Score (bar) with 1,000-resample bootstrap median and 95% interval (dot and whiskers).*

## 11.1 Why Matheesha Pathirana ranks first

Pathirana has the best pressure wicket strike rate in the list: **48 wickets in 529 balls, one every 11.0 balls**, at a **16.0 average**, with a 38.0% dot rate. His economy is 8.73, which is not the lowest in the list, and it is slightly worse than his own normal economy (8.22), so his case is not built on economy lift. It is built on the rarest and most valuable pressure skill: taking wickets. He also has the largest death-over pressure sample in the list (342 balls, 35 wickets) and evidence in both IPL and T20I.

The margin over Sunil Narine is 1.8 points. Narine has better control (7.44 economy, 12.2% boundaries) but a much lower wicket rate (24 wickets at 19.4 balls per wicket). The locked weights put 24% on wicket rate and 32% on economy, and Pathirana's wicket advantage narrowly outweighs Narine's control advantage. An economy-heavy weighting puts Narine first (Section 14), which is a legitimate alternative view rather than a contradiction.

## 11.2 Player evidence

### 1. Matheesha Pathirana — Chennai Super Kings — score 94.40

**Sample.** 529 pressure legal balls in 33 innings across 54 matches (T20; T20I; 2022; 2023; 2024; 2024/25; 2025; 2026). His normal comparison uses 357 balls.

**Pressure versus normal.** In pressure he took **48 wickets** at **8.73 economy**, a 16.0 average and a 11.0 strike rate, with 38.0% dots and 17.2% boundaries. In normal cricket his economy was 8.22. Economy shift (normal − pressure): **-0.51**; wicket-rate shift: **+0.010**. Consistency is 0.57; 58% of his pressure innings beat par.

**Why he is selected.** The best pressure strike rate in the list (11.0 balls per wicket) with a 16.0 average and 38% dots. He is a genuine wicket-taking weapon in the death overs, where 342 of his 529 pressure balls were bowled.

**What could go wrong.** His economy is 8.73 and slightly worse than his own normal, so he is not a control bowler. The top-10 probability is 0.92, but the score interval is wide and the profile is role-specific. Bootstrap 95% interval: score 66.3–97.9, rank 1–15, top-10 probability 0.92.

**Pressure innings examples.** 4/23 off 23 vs Mumbai Indians (2024-04-14, T20, pressure 69.2); 4/40 off 24 vs India (2024-07-27, T20I, pressure 63.1).

### 2. Sunil Narine — Kolkata Knight Riders — score 92.58

**Sample.** 466 pressure legal balls in 34 innings across 67 matches (T20; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 528 balls.

**Pressure versus normal.** In pressure he took **24 wickets** at **7.44 economy**, a 24.1 average and a 19.4 strike rate, with 38.0% dots and 12.2% boundaries. In normal cricket his economy was 6.35. Economy shift (normal − pressure): **-1.09**; wicket-rate shift: **+0.020**. Consistency is 0.70; 74% of his pressure innings beat par.

**Why he is selected.** The best control in the list: 7.44 economy, 12.2% boundaries and 38% dots across 466 IPL pressure balls. His wicket rate also rises under pressure (+0.02), so the control does not come at the cost of threat.

**What could go wrong.** The sample is IPL-only, and his economy is 1.09 worse than his own normal. An economy-heavy weighting ranks him first; the locked weights rank him second. Bootstrap 95% interval: score 67.3–97.1, rank 1–15, top-10 probability 0.92.

**Pressure innings examples.** 3/10 off 12 vs Delhi Capitals (2025-04-29, T20, pressure 67.1); 2/21 off 24 vs Rajasthan Royals (2022-04-18, T20, pressure 62.5).

### 3. Ravichandran Ashwin — Rajasthan Royals — score 91.13

**Sample.** 379 pressure legal balls in 29 innings across 61 matches (T20; T20I; 2022; 2022/23; 2023; 2024; 2025). His normal comparison uses 385 balls.

**Pressure versus normal.** In pressure he took **24 wickets** at **7.76 economy**, a 20.4 average and a 15.8 strike rate, with 32.5% dots and 11.9% boundaries. In normal cricket his economy was 7.43. Economy shift (normal − pressure): **-0.32**; wicket-rate shift: **+0.030**. Consistency is 0.59; 62% of his pressure innings beat par.

**Why he is selected.** The best balance of control and wicket-taking in the top three: 7.76 economy, 20.4 average, 15.8 strike rate and only 11.9% boundaries. His wicket rate improves by 0.04 under pressure.

**What could go wrong.** The sample is 379 balls, the smallest in the top three. His T20I share is small (76 balls), and availability or role changes are outside the model. Bootstrap 95% interval: score 59.5–96.7, rank 1–20, top-10 probability 0.86.

**Pressure innings examples.** 3/8 off 13 vs Delhi Capitals (2024-05-07, T20, pressure 60.9); 2/16 off 18 vs Mumbai Indians (2023-04-30, T20, pressure 61.5).

### 4. Rashid Khan — Gujarat Titans — score 84.90

**Sample.** 819 pressure legal balls in 57 innings across 122 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 1040 balls.

**Pressure versus normal.** In pressure he took **62 wickets** at **8.68 economy**, a 19.1 average and a 13.2 strike rate, with 32.8% dots and 17.1% boundaries. In normal cricket his economy was 7.18. Economy shift (normal − pressure): **-1.50**; wicket-rate shift: **+0.030**. Consistency is 0.60; 63% of his pressure innings beat par.

**Why he is selected.** The largest workload among the ten: 819 balls and 62 wickets at a 19.1 average and 13.2 strike rate. He remains a wicket-taking threat even when his economy rises.

**What could go wrong.** His economy is 8.68 and 1.50 worse than his own normal, the second-largest deterioration in the list. The top-10 probability is 0.69. Bootstrap 95% interval: score 47.9–95.7, rank 1–29, top-10 probability 0.69.

**Pressure innings examples.** 4/29 off 23 vs Rajasthan Royals (2026-05-09, T20, pressure 63.1); 4/23 off 18 vs Mumbai Indians (2023-05-12, T20, pressure 62.1).

### 5. Haris Rauf — Pakistan — score 83.33

**Sample.** 380 pressure legal balls in 28 innings across 48 matches (T20I; 2022; 2022/23; 2023; 2024; 2025). His normal comparison uses 237 balls.

**Pressure versus normal.** In pressure he took **36 wickets** at **9.11 economy**, a 16.0 average and a 10.6 strike rate, with 40.3% dots and 18.9% boundaries. In normal cricket his economy was 8.51. Economy shift (normal − pressure): **-0.60**; wicket-rate shift: **+0.040**. Consistency is 0.46; 46% of his pressure innings beat par.

**Why he is selected.** A strike bowler: 36 wickets in 380 T20I balls, a 16.0 average and 10.6 strike rate, with 40.3% dots. His wicket rate improves by 0.04 under pressure.

**What could go wrong.** The sample is T20I-only, the economy is high (9.11), and consistency is 0.46. The top-10 probability is 0.53. Bootstrap 95% interval: score 29.6–94.6, rank 1–40, top-10 probability 0.53.

**Pressure innings examples.** 4/17 off 18 vs New Zealand (2023-04-15, T20I, pressure 66.4); 4/17 off 15 vs New Zealand (2023-04-14, T20I, pressure 61.9).

### 6. Jasprit Bumrah — Mumbai Indians — score 82.22

**Sample.** 504 pressure legal balls in 37 innings across 75 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 538 balls.

**Pressure versus normal.** In pressure he took **27 wickets** at **8.00 economy**, a 24.9 average and a 18.7 strike rate, with 34.3% dots and 15.5% boundaries. In normal cricket his economy was 6.83. Economy shift (normal − pressure): **-1.17**; wicket-rate shift: **+0.010**. Consistency is 0.65; 65% of his pressure innings beat par.

**Why he is selected.** Elite boundary prevention (15.5%) and a 24.9 average across 504 balls in both formats. He concedes few boundaries even when he is not taking wickets.

**What could go wrong.** His wicket rate is lower than the top four (18.7 balls per wicket), and his economy is 1.17 worse than his own normal. The top-10 probability is 0.59. Bootstrap 95% interval: score 33.3–96.9, rank 1–38, top-10 probability 0.59.

**Pressure innings examples.** 4/6 off 10 vs Royal Challengers Bengaluru (2024-04-11, T20, pressure 64.6); 3/9 off 12 vs Lucknow Super Giants (2025-04-27, T20, pressure 69.3).

### 7. Mohammed Siraj — Royal Challengers Bengaluru — score 79.66

**Sample.** 451 pressure legal balls in 43 innings across 83 matches (T20; T20I; 2022; 2022/23; 2023; 2024; 2025; 2026). His normal comparison uses 488 balls.

**Pressure versus normal.** In pressure he took **36 wickets** at **9.70 economy**, a 20.2 average and a 12.5 strike rate, with 39.0% dots and 23.5% boundaries. In normal cricket his economy was 8.57. Economy shift (normal − pressure): **-1.13**; wicket-rate shift: **+0.040**. Consistency is 0.44; 47% of his pressure innings beat par.

**Why he is selected.** Wicket-taking volume: 36 wickets in 451 balls at a 12.5 strike rate, with a 20.3 average. His wicket rate improves by 0.04 under pressure.

**What could go wrong.** The economy is 9.70 and the boundary rate is 23.5%, both high. Consistency is the weakest in the list (0.44), and the top-10 probability is 0.50. Bootstrap 95% interval: score 36.1–93.1, rank 2–38, top-10 probability 0.50.

**Pressure innings examples.** 3/3 off 10 vs New Zealand (2022-11-22, T20I, pressure 64.0); 3/17 off 12 vs Punjab Kings (2024-05-09, T20, pressure 67.0).

### 8. Yuzvendra Chahal — Rajasthan Royals — score 79.43

**Sample.** 804 pressure legal balls in 53 innings across 98 matches (T20; T20I; 2022; 2022/23; 2023; 2024; 2025; 2026). His normal comparison uses 573 balls.

**Pressure versus normal.** In pressure he took **55 wickets** at **8.97 economy**, a 21.9 average and a 14.6 strike rate, with 28.7% dots and 16.3% boundaries. In normal cricket his economy was 8.66. Economy shift (normal − pressure): **-0.31**; wicket-rate shift: **+0.020**. Consistency is 0.52; 53% of his pressure innings beat par.

**Why he is selected.** The second-highest pressure wicket-taker among the ten: 55 wickets in 804 balls at a 21.9 average and 14.6 strike rate. His economy rise is modest (−0.31).

**What could go wrong.** His dot rate is low (28.7%) and his economy is 8.97. The top-10 probability is 0.53. Bootstrap 95% interval: score 42.0–92.3, rank 2–31, top-10 probability 0.53.

**Pressure innings examples.** 4/15 off 20 vs Sunrisers Hyderabad (2023-04-02, T20, pressure 63.3); 3/22 off 24 vs Sunrisers Hyderabad (2022-03-29, T20, pressure 64.9).

### 9. Josh Hazlewood — Royal Challengers Bengaluru — score 76.65

**Sample.** 443 pressure legal balls in 36 innings across 65 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 460 balls.

**Pressure versus normal.** In pressure he took **34 wickets** at **9.14 economy**, a 19.9 average and a 13.0 strike rate, with 40.6% dots and 22.6% boundaries. In normal cricket his economy was 7.97. Economy shift (normal − pressure): **-1.17**; wicket-rate shift: **+0.010**. Consistency is 0.48; 50% of his pressure innings beat par.

**Why he is selected.** A dot-ball and wicket profile: 40.6% dots, 19.9 average and 13.0 strike rate in 443 pressure balls. He builds pressure even when he is not the main wicket-taker.

**What could go wrong.** His economy is 9.14 and 1.17 worse than his own normal, and consistency is 0.48. The top-10 probability is 0.43. Bootstrap 95% interval: score 34.6–93.1, rank 1–36, top-10 probability 0.43.

**Pressure innings examples.** 3/20 off 14 vs Delhi Capitals (2022-04-16, T20, pressure 68.1); 2/10 off 12 vs Sunrisers Hyderabad (2022-05-08, T20, pressure 67.9).

### 10. Noor Ahmad — Chennai Super Kings — score 76.60

**Sample.** 554 pressure legal balls in 34 innings across 70 matches (T20; T20I; 2022; 2023; 2024; 2025; 2026). His normal comparison uses 471 balls.

**Pressure versus normal.** In pressure he took **38 wickets** at **8.74 economy**, a 21.2 average and a 14.6 strike rate, with 34.5% dots and 16.6% boundaries. In normal cricket his economy was 6.75. Economy shift (normal − pressure): **-1.99**; wicket-rate shift: **+0.020**. Consistency is 0.50; 50% of his pressure innings beat par.

**Why he is selected.** A wicket-taking spinner: 38 wickets in 554 balls at a 21.2 average and 14.6 strike rate, with evidence in both formats across five seasons.

**What could go wrong.** His economy deteriorates more than any other selected bowler (−1.99 against his own normal), so the selection is driven by wickets and absolute economy. The top-10 probability is 0.41, the lowest in the list. Bootstrap 95% interval: score 34.1–92.4, rank 1–37, top-10 probability 0.41.

**Pressure innings examples.** 3/21 off 24 vs Gujarat Titans (2025-05-25, T20, pressure 64.8); 3/26 off 21 vs Royal Challengers Bengaluru (2025-03-28, T20, pressure 62.9).

![Figure 8. Component contributions for the final top 10 bowlers. Economy and wicket rate dominate, but the mix differs sharply between control and strike bowlers.](component_heatmap_bowlers.png)

*Figure 8. Component contributions for the final top 10 bowlers. Economy and wicket rate dominate, but the mix differs sharply between control and strike bowlers.*

The bowling list is a mix of control spinners (Narine, Ashwin, Chahal), wicket-taking quicks (Pathirana, Rauf, Siraj, Hazlewood) and all-phase bowlers (Rashid, Bumrah, Noor). That diversity is a feature, not a defect: pressure bowling can be played in more than one way, and the score does not force a single archetype. It does, however, mean that the ordering is sensitive to the balance between economy and wickets, which Section 14 tests.

---

# 12. Reading the list: what it says and what it does not

A ranking is only useful if its boundaries are clear. This section draws out the patterns that survive the model and separates them from claims the model cannot support.

![Figure 9. Pressure performance against normal performance. Points above the diagonal improved under pressure; points below it did not. The selected batters and bowlers are highlighted.](pressure_vs_normal_scatter.png)

*Figure 9. Pressure performance against normal performance. Points above the diagonal improved under pressure; points below it did not. The selected batters and bowlers are highlighted.*

## 12.1 What the list says

- **Pressure performance is not the same as career performance.** Several high-profile career totals do not appear, and several middle-order specialists do. That is the intended consequence of measuring pressure balls only and comparing each player with their own normal level.
- **Batting pressure is a middle-order skill in this data.** The selected batters are overwhelmingly finishers and middle-order accumulators. The task-difficulty component is highest in chases and in the death overs, and those are the situations in which these players bat.
- **Bowling pressure can be played in different ways.** The list contains control spinners, strike quicks and all-phase bowlers. The model rewards both economy and wickets, so it does not force a single archetype.
- **Two-format evidence is the norm.** Seven of the ten batters and eight of the ten bowlers have pressure evidence in both IPL and T20I. The five single-format selections are flagged, not hidden.
- **The top of each list is more robust than the bottom.** The leader in each role has the highest top-10 probability, and the top three survive most weight and eligibility variants. Ranks 4–10 move substantially under reasonable changes.
- **Rajasthan Royals interest is present but not manufactured.** Ravichandran Ashwin (3rd), Yuzvendra Chahal (8th) and Dhruv Jurel (10th) are selected on the same rule as everyone else. No RR player was added or moved for team reasons.

## 12.2 What the list does not say

- It does not say who will perform best next season. It is a retrospective pressure-performance index, not a forecast.
- It does not measure availability, fitness, age, injury history, salary, auction value or team balance. Those are selection constraints, not performance evidence, and they are outside the brief.
- It does not adjust for opposition strength, venue, pitch or travel. Those factors are real; the data does not support a reliable ball-level adjustment for them within the scope of this challenge.
- It does not claim that a player with a low score is a bad player. A player with too few pressure balls is not ranked at all; a player with a low score may simply have had a poor pressure sample.
- It does not treat IPL and T20I as interchangeable. Every rate is format-relative, and single-format players are marked.
- It does not claim statistical certainty. The bootstrap intervals in Section 13 are wide, especially for ranks 4–10.

The honest summary is that the list identifies a **cohort** of players with strong pressure evidence, and a **ranking** within that cohort that is model-dependent below the top few. A selection committee should treat ranks 1–3 as the strongest claims and ranks 4–10 as a shortlist of comparable candidates.

---

# 13. Reliability and uncertainty

The score is computed from a finite sample, so it has sampling error. To measure that error, each player's pressure and normal innings were resampled with replacement 1,000 times (seed 20261117), and the entire model — including the population median and MAD used for standardisation — was recomputed in each replicate. The result is an interval that reflects both the player's sampling noise and the re-standardisation of the league.

The bootstrap covers **233 batters** and **217 bowlers** with at least 60 pressure balls. The mean absolute score gap between the bootstrap and the original score is **3.51 points for batters** and **2.92 for bowlers**. The Spearman correlation between the bootstrap mean rank and the original rank is 0.997 for batters and 0.996 for bowlers, so the model is stable in aggregate even though individual intervals are wide.

**Table 20. Bootstrap uncertainty for the twenty selected players.**

| Role | Rank | Player | Score | 95% score interval | 95% rank interval | P(top 10) |
| :--- | :---: | :--- | ---: | :---: | :---: | ---: |
| Batter | 1 | Tim David | 97.10 | 66.0–99.4 | 1–29 | 0.74 |
| Batter | 2 | Mark Chapman | 96.59 | 65.6–99.4 | 1–31 | 0.70 |
| Batter | 3 | Suryakumar Yadav | 96.35 | 66.5–99.1 | 1–29 | 0.69 |
| Batter | 4 | Ashutosh Sharma | 96.19 | 69.9–99.2 | 1–25 | 0.68 |
| Batter | 5 | Rovman Powell | 94.12 | 54.5–98.8 | 1–40 | 0.51 |
| Batter | 6 | David Miller | 93.74 | 47.8–99.2 | 1–45 | 0.51 |
| Batter | 7 | Dinesh Karthik | 93.13 | 47.6–99.1 | 1–46 | 0.49 |
| Batter | 8 | Ayush Badoni | 90.29 | 55.4–96.5 | 3–39 | 0.33 |
| Batter | 9 | Namboori Tilak Varma | 89.35 | 45.4–98.5 | 1–48 | 0.38 |
| Batter | 10 | Dhruv Jurel | 88.41 | 46.9–98.4 | 1–42 | 0.36 |
| Bowler | 1 | Matheesha Pathirana | 94.40 | 66.3–97.9 | 1–15 | 0.92 |
| Bowler | 2 | Sunil Narine | 92.58 | 67.3–97.1 | 1–15 | 0.92 |
| Bowler | 3 | Ravichandran Ashwin | 91.13 | 59.5–96.7 | 1–20 | 0.86 |
| Bowler | 4 | Rashid Khan | 84.90 | 47.9–95.7 | 1–29 | 0.69 |
| Bowler | 5 | Haris Rauf | 83.33 | 29.6–94.6 | 1–40 | 0.53 |
| Bowler | 6 | Jasprit Bumrah | 82.22 | 33.3–96.9 | 1–38 | 0.59 |
| Bowler | 7 | Mohammed Siraj | 79.66 | 36.1–93.1 | 2–38 | 0.50 |
| Bowler | 8 | Yuzvendra Chahal | 79.43 | 42.0–92.3 | 2–31 | 0.53 |
| Bowler | 9 | Josh Hazlewood | 76.65 | 34.6–93.1 | 1–36 | 0.43 |
| Bowler | 10 | Noor Ahmad | 76.60 | 34.1–92.4 | 1–37 | 0.41 |

*Intervals are 2.5th–97.5th percentiles of 1,000 resamples. The rank interval is computed among all players with at least 60 pressure balls, not only the eligible group.*

![Figure 10. Bootstrap top-10 probability for the selected batters. The leader is the most secure; ranks 4–10 overlap heavily.](bootstrap_top10_batters.png)

*Figure 10. Bootstrap top-10 probability for the selected batters. The leader is the most secure; ranks 4–10 overlap heavily.*

![Figure 11. Bootstrap top-10 probability for the selected bowlers. Pathirana and Narine are the most secure.](bootstrap_top10_bowlers.png)

*Figure 11. Bootstrap top-10 probability for the selected bowlers. Pathirana and Narine are the most secure.*

Three conclusions follow. First, the leaders are reasonably secure: Tim David has a 0.74 probability of a top-10 finish and Pathirana has 0.92, while Narine also has 0.92. Second, the lower half is not secure: Ayush Badoni (0.33), Dhruv Jurel (0.36), Noor Ahmad (0.41) and Josh Hazlewood (0.43) are closer to coin flips than certainties. Third, the score intervals are wide even for players with large samples, because the model re-standardises the population in every replicate. That is an honest reflection of the information in a 250–800 ball pressure sample.

The bootstrap assumes that innings are exchangeable within a player. They are not: opposition, venue, match state and team strength vary. The intervals should therefore be read as a **lower bound on uncertainty**, not a full predictive distribution. A hierarchical model with match and opponent effects would be the natural next step, but it would add complexity without changing the central conclusion: the top of the list is stable, the middle is not.

**Consistency across matches** is also reported directly. The positive-innings rate ranges from 45% (Tilak Varma) to 73% (Tim David) among selected batters, and from 46% (Haris Rauf) to 74% (Sunil Narine) among selected bowlers. The season consistency term is smoothed for players with few seasons, so it cannot be gamed by a single good tournament.

---

# 14. Sensitivity analysis

A ranking that survives only one set of choices is not evidence. The model was re-run under 21 scenarios: the locked baseline, four alternative weightings, two component removals, stricter and more relaxed eligibility, stricter and more lenient pressure thresholds, IPL-only and T20I-only pools, and eight leave-one-season-out variants. The table reports how many of the original top 10 survive and the maximum rank movement.

**Table 21. Sensitivity of the final top 10 to reasonable model changes.**

| Scenario | Batting overlap | Bowling overlap | Max bat move | Max bowl move | Assessment |
| :--- | :---: | :---: | :---: | :---: | :--- |
| Locked baseline | — | — | — | — | Reference |
| Batting weights: output-heavy | 8/10 | 10/10 | 2 | 0 | Mostly stable |
| Batting weights: lift-heavy | 8/10 | 10/10 | 5 | 0 | Mostly stable |
| Bowling weights: economy-heavy | 10/10 | 10/10 | 0 | 4 | Stable |
| Bowling weights: wicket-heavy | 10/10 | 8/10 | 0 | 4 | Mostly stable |
| Remove lift component | 7/10 | 9/10 | 4 | 4 | Mostly stable |
| Remove consistency component | 9/10 | 10/10 | 2 | 2 | Stable |
| Stricter eligibility | 9/10 | 10/10 | 1 | 0 | Stable |
| Relaxed eligibility | 8/10 | 9/10 | 2 | 1 | Mostly stable |
| Stricter pressure thresholds | 5/10 | 2/10 | 7 | 6 | Large change |
| More lenient pressure thresholds | 4/10 | 6/10 | 5 | 5 | Large change |
| IPL only | 6/10 | 8/10 | 7 | 5 | Material change |
| T20I only | 3/10 | 1/10 | 4 | 4 | Large change |
| Leave out 2022 | 8/10 | 6/10 | 6 | 4 | Material change |
| Leave out 2022/23 | 9/10 | 9/10 | 2 | 2 | Stable |
| Leave out 2023 | 8/10 | 8/10 | 4 | 5 | Mostly stable |
| Leave out 2023/24 | 10/10 | 10/10 | 1 | 0 | Stable |
| Leave out 2024 | 6/10 | 8/10 | 4 | 6 | Material change |
| Leave out 2024/25 | 10/10 | 10/10 | 0 | 0 | Stable |
| Leave out 2025 | 6/10 | 7/10 | 5 | 2 | Material change |
| Leave out 2026 | 7/10 | 9/10 | 7 | 7 | Mostly stable |

*Overlap is the number of players shared with the locked top 10. Max move is the largest rank change among retained players. 'Reference' is the locked model.*

## 14.1 What survives

**Weights.** Changing batting weights leaves 7–10 of the batting top 10 intact; changing bowling weights leaves 8–10 of the bowling top 10 intact. The top three batters survive an output-heavy weighting (Suryakumar first) and a no-lift weighting (David first). The top three bowlers survive an economy-heavy weighting (Narine first) and a no-lift weighting, but a wicket-heavy weighting promotes Rauf and Rashid above Ashwin and drops Narine to sixth. The economy-versus-wickets balance is therefore the main modelling choice for bowlers.

**Eligibility.** Stricter eligibility removes Ashutosh Sharma (248 balls) and replaces him with Sikandar Raza; it leaves the bowling top 10 unchanged. Relaxed eligibility introduces Matthew Wade and Naman Dhir and removes Dhruv Jurel. Nine of ten batters and all ten bowlers survive stricter eligibility. The sample rules matter at the margin, not at the top.

**Seasons.** Leave-one-season-out is the most reassuring test for the core of the list. Removing any single season leaves 6–10 of the batting top 10 and 6–10 of the bowling top 10. Removing 2023/24 or 2024/25 changes nothing; removing 2022 removes Suryakumar Yadav from the batting list because that season carries a large part of his pressure sample. The list is not built on one tournament, but individual players can be.

## 14.2 What does not survive: the pressure threshold

The pressure threshold is the most consequential choice in the model. Moving it changes both the sample and the player pool, and the rankings move with it.

**Table 22. Pressure thresholds and their effect on the sample and the top 10.**

| Threshold set | Bat pressure balls | Bat share | Bowl pressure balls | Bowl share | Top-10 overlap |
| :--- | ---: | ---: | ---: | ---: | :---: |
| Locked (58 / 70 batting; 60 / 67 bowling) | 50,643 | 27.2% | 56,512 | 30.4% | 10 / 10 |
| Stricter (62 / 72; 64 / 70) | 35,178 | 18.9% | 25,768 | 13.9% | 5 bat / 2 bowl |
| More lenient (52 / 64; 55 / 62) | 75,052 | 40.2% | 91,124 | 49.0% | 4 bat / 6 bowl |

*Shares use batter balls (186,515) and legal balls (185,950) as denominators. Stricter thresholds shrink the pressure sample by about 31% for batters and 54% for bowlers; lenient thresholds expand it by about 48% and 61% respectively.*

A stricter definition is not automatically better. It removes ordinary high-leverage balls, but it also shrinks the sample below the point where many players can be ranked: only 25,768 legal balls remain for bowlers, and the eligible pool collapses. The strict-threshold bowling list contains only a handful of eligible players and produces compressed, unstable scores (third place falls to 61.5). A more lenient definition is also not better: it labels 40% of batter balls and 49% of legal balls as pressure, which dilutes the contrast with normal cricket and pulls in players whose records are strong in ordinary situations. The locked thresholds sit between these failure modes and are validated against outcomes in Section 6.

## 14.3 Format splits: a different pool, not a contradiction

The IPL-only and T20I-only runs answer a different question. IPL-only asks who performed in the IPL; T20I-only asks who performed in international cricket. They are not subsets of the same ranking, and the overlap is correspondingly lower: 6 of 10 batters and 8 of 10 bowlers for IPL-only; 3 of 10 batters and 1 of 10 bowlers for T20I-only.

The format-specific records explain the split. Tim David scores at 170.7 in IPL pressure and 200.8 in T20I pressure; both are strong, so he survives either view. Pathirana concedes 8.56 in IPL pressure and 9.37 in T20I; Rashid Khan concedes 9.54 in IPL and 7.18 in T20I; Bumrah concedes 7.88 and 8.29. The T20I-only bowling list is almost entirely different (Rauf, Bishnoi, Chakravarthy, Hasaranga) because many IPL control bowlers have small T20I pressure samples. That is a fact about international selection and sample size, not evidence that one list is wrong.

The defensible conclusion is that the combined ranking is the right answer to the official brief, which explicitly includes both IPL and T20I, while the format splits are a diagnostic. A selector who wants an IPL-only squad should use the IPL-only column and accept that it is a different question.

---

# 15. Limitations and disclosures

The model is transparent about what it cannot do. The limitations below are not footnotes; they are part of the submission and are reflected in the audit status.

**Table 23. Limitations, consequences and treatment.**

| # | Limitation | Why it matters | How it is handled |
| :---: | :--- | :--- | :--- |
| 1 | Team totals are a lower bound of about 1–2 runs per innings. | Required run rate and projected totals are slightly understated. | Disclosed; batter and bowler runs are exact; sensitivity shows the ranking is not driven by the bias. |
| 2 | Pressure thresholds are a modelling choice. | Stricter thresholds change 5/10 batting and 2/10 bowling selections. | Fixed before ranking; three threshold sets reported; outcomes validated. |
| 3 | Normal samples can be much smaller than pressure samples. | Lift is noisy for players such as Ashutosh Sharma (23 normal balls). | Lift is shrunk by both sample sizes; absolute output carries most weight. |
| 4 | Bootstrap assumes innings are exchangeable. | Opponent, venue and match-state correlation are ignored. | Intervals are presented as a lower bound on uncertainty. |
| 5 | No opposition-quality adjustment. | Facing Bumrah is not the same as facing a part-timer. | Not modelled; disclosed; would require a separate bowler/batter rating. |
| 6 | No venue, pitch or weather adjustment. | Scoring environments differ materially. | Format baselines only; disclosed. |
| 7 | Role and batting position are not explicit inputs. | A finisher and an opener face different pressure tasks. | Phase and task components capture some of it; role is not forced. |
| 8 | IPL and T20I are pooled within a player. | A player's mixed record may hide format-specific strengths. | Every ball is format-relative; single-format players flagged; splits reported. |
| 9 | Selection bias: only players who bat/bowl in pressure qualify. | A protected player may never face the hardest overs. | Eligibility makes the limitation visible; it cannot be fully corrected. |
| 10 | Super overs and non-IPL T20 are excluded. | A small amount of high-pressure cricket is outside the sample. | Scope follows the official brief; exclusions documented. |
| 11 | The score is a relative index, not a probability. | A score of 90 is not a 90% chance of future success. | Stated in the report and dashboard; bootstrap gives explicit probabilities. |
| 12 | Availability, fitness, age and team balance are outside the model. | The top 10 is not a selectable XI. | Treated as selection constraints, not performance evidence. |

*Each limitation is either corrected, bounded or disclosed. None is silently ignored.*

Two limitations deserve emphasis. First, the threshold sensitivity is material. A selector who believes pressure should be reserved for the last five overs and the tightest chases will get a different list. The locked definition is defensible, but it is not the only defensible one, and the report gives the reader the tools to see the difference. Second, the normal-sample imbalance means the lift component is less reliable than the absolute components. This is why the absolute pressure level carries the majority of the weight in both roles.

---

# 16. Reproducibility and independent audit

The pipeline is linear and deterministic. Each stage reads the previous output; the final export writes the CSVs, the evidence file, the dashboard data and the charts. All randomness uses seed 20261117. The raw files are never modified.

```
python analysis/scripts/ss_common.py            # build cleaned deliveries
python analysis/scripts/04_validate_pressure.py # validate pressure bands
python analysis/scripts/05_player_metrics.py    # player pressure/normal tables
python analysis/scripts/06_scoring_model.py     # scores, eligibility, ranks
python analysis/scripts/07_sensitivity.py --all --reps 1000
python analysis/scripts/08_export_submission.py # CSVs, evidence, dashboard, charts
python analysis/scripts/09_build_report.py      # this report (MD, HTML, PDF, DOCX)
python analysis/scripts/11_audit.py             # independent re-implementation
pytest tests                                    # automated consistency checks
```

The independent audit re-reads the cleaned delivery table, recomputes the pressure indices and player aggregates from scratch, re-runs the scoring model, and compares the results with the submission files. It checks:

- delivery identity uniqueness and scope counts;
- run, ball, extra and wicket accounting against the documented rules;
- the pressure distribution and category shares;
- player pressure/normal aggregates and the top-10 membership;
- score, rank and eligibility consistency between the parquet tables, CSVs, evidence JSON and dashboard JSON;
- the absence of duplicate players and the 1–10 rank sequence;
- the report's headline numbers against the analysis outputs.

The audit does not reuse the model code. It is a second implementation written against the documented rules, so a coding error in the main pipeline would show up as a discrepancy rather than being reproduced. The audit report records every check, the tolerance, and the final status.

## 16.1 File hashes

**Table 24. Integrity hashes for the submission data files.**

| File | Contents | Size | SHA-256 (first 16) |
| :--- | :--- | ---: | :--- |
| FINAL_TOP_10_BATTERS.csv | Final batting top 10 | 2 KB | ce4dd15db1ebeb4e… |
| FINAL_TOP_10_BOWLERS.csv | Final bowling top 10 | 2 KB | 694a953c0b9842b6… |
| ELIGIBILITY_TABLE.csv | Every scored player with eligibility | 123 KB | b7286ae6203ceb03… |
| TOP_10_EVIDENCE.json | Machine-readable evidence for 20 players | 119 KB | 73697a7b9faa6b87… |

*Full hashes can be regenerated with Get-FileHash (Windows) or sha256sum (Linux/macOS). The report files are excluded because they contain this table.*

The companion dashboard reads `public/data/dashboard.json` and `public/data/evidence.json`, both generated by the export script. It does not fetch live data and contains no hand-entered player values. It uses a hash router so it can be served from a static folder, and it presents the same rankings, evidence and uncertainty as this report.

---

# 17. Conclusion

The challenge asks for a defensible answer to a hard question: who performs when it matters? This submission answers it with a pre-delivery pressure definition, a format-relative performance model, a sample-size rule that refuses to rank anecdotes, and an uncertainty analysis that shows where the answer is strong and where it is not.

The pressure model behaves as it should. Extreme batting balls carry a 9.77% dismissal rate against 5.13% on normal balls. Extreme bowling balls cost 10.20 per over against 8.08, with a wicket rate of 8.57% against 4.87%. The gradient holds within phases for scoring difficulty, and the component structure is explainable to a cricket analyst.

The final lists are led by **Tim David (97.10)** and **Matheesha Pathirana (94.40)**. Both have large pressure samples, both have evidence in more than one competition and both lead on the skills the model is designed to reward: sustained scoring and wicket-taking under pressure. The margins at the top are small, and the report says so.

The honest verdict is **READY WITH DISCLOSED LIMITATIONS**. The method is reproducible, the accounting is correct, the rankings follow the stated rule and the evidence is complete. The uncertainty is real: bootstrap rank intervals are wide for ranks 4–10, the pressure threshold is a material modelling choice, and the two competitions are pooled within players. Those limitations are stated, quantified and tested rather than hidden. For a selection decision, the right use of this work is to treat the top three in each role as strong evidence and ranks 4–10 as a comparable shortlist requiring judgement beyond the data.

---

# Appendix A. Formula reference

**Batting Pressure Index**

```
task = chase ? sigmoid((RRR - par_RR - 0.30) / 1.60)
             : sigmoid((par_total - projected_total) / (par_total * 0.09))
resource = 0.5 * (1 - (wickets_left / 10) ** (balls_left / scheduled_balls))
         + 0.5 * (wickets_lost / 10)
phase = 0.30 | 0.55 | 0.85
closeness = exp(-abs(projected_margin) / 20)
BPI = 100 * (0.50*task + 0.22*resource + 0.16*phase + 0.12*closeness)
```

**Bowling Pressure Index**

```
threat = 0.85 * score_threat + 0.15 * (wickets_left / 10)
resource = (wickets_left / 10) * (0.5 + 0.5 * balls_left_fraction)
closeness = exp(-abs(projected_margin) / 20)
WPI = 100 * (0.55*threat + 0.05*resource + 0.20*phase + 0.20*closeness)
```

**Shrinkage, lift and consistency**

```
rate_EB = (successes + k * baseline_rate) / (trials + k)
lift_shrink = (p_balls / (p_balls + 200)) * sqrt(n_balls / (n_balls + 200))
pos_EB = (positive_innings + 4) / (innings + 8)
season_EB = (positive_seasons + 1) / (seasons + 2)
consistency = 0.70 * pos_EB + 0.30 * season_EB
```

**Standardisation and score**

```
z = clip((x - median(ref)) / (1.4826 * MAD(ref)), -3, +3)
composite = sum(w_i * z_i) / sum(w_i)
confidence = 0.85 + 0.15 * min(1, sqrt(pressure_balls / 400 or 500))
score = 100 * Phi(composite * confidence)
```

---

# Appendix B. Eligibility and sample distribution

**Table 25. Eligibility and pressure-sample distribution.**

| Metric | Batters | Bowlers |
| :--- | ---: | ---: |
| Players scored | 824 | 596 |
| Fully eligible | 67 | 52 |
| Limited sample | 82 | 75 |
| Insufficient evidence | 675 | 469 |
| Median pressure balls (full) | 295 | 441 |
| 25th–75th percentile pressure balls | 257–416 | 379–556 |
| Minimum pressure balls (full) | 200 | 302 |
| Maximum pressure balls (full) | 726 | 1072 |
| Median pressure innings (full) | 24 | 33 |
| Minimum pressure innings (full) | 13 | 20 |

*Pressure innings require at least 3 balls faced (batting) or 6 legal balls bowled (bowling).*

The fully eligible group is a small fraction of the population: 67 of 824 batters (8.1%) and 52 of 596 bowlers (8.7%). That is expected. Most players in a multi-season T20 dataset do not face 200 pressure balls, and many are bowlers who bat rarely or batters who bowl rarely. The rule is designed to be demanding: it is better to say 'not enough evidence' than to rank a player on 30 balls.

The selected players sit well above the minimum. The smallest pressure samples in the top 10 are 248 balls (Ashutosh Sharma) and 257 (Dhruv Jurel) for batters, and 379 (Ravichandran Ashwin) and 380 (Haris Rauf) for bowlers. Every selection clears the innings requirement as well as the ball requirement.

---

# Appendix C. Glossary

**Table 26. Glossary of terms.**

| Term | Meaning in this report |
| :--- | :--- |
| Pressure sample | Deliveries classified High or Extreme for the relevant role. |
| Normal sample | Deliveries classified Normal (BPI < 40, WPI < 45). |
| Moderate | The transition band between Normal and High; excluded from both samples. |
| BPI / WPI | Batting Pressure Index / Bowling Pressure Index, on a 0–100 scale. |
| Legal ball | A delivery that counts toward the over: excludes wides, no-balls and penalties. |
| Batter ball | A delivery that counts as a ball faced: excludes wides and penalties. |
| Bowler wicket | Caught, Bowled, LBW, Stumped or Hit Wicket. Run-outs and obstruction are not credited. |
| Economy | Runs conceded per over (six legal balls). |
| Strike rate (batting) | Runs per 100 balls faced. |
| Strike rate (bowling) | Legal balls per wicket. |
| Lift | Pressure performance minus normal performance; positive is better, including for bowling economy (normal − pressure). |
| Empirical Bayes | Shrinking a player's rate toward a format baseline in proportion to sample size. |
| Robust z-score | Standardisation using the median and median absolute deviation, clipped at ±3. |
| Bootstrap | Resampling innings with replacement to estimate the sampling distribution of the score and rank. |
| Fully Eligible | A player who clears the ball, innings and match minimums and can receive a final rank. |

---

# Appendix D. Deliverable manifest

**Table 27. Submission manifest.**

| Deliverable | Path | Description |
| :--- | :--- | :--- |
| Batting top 10 | submission/FINAL_TOP_10_BATTERS.csv | Ordered 1–10 with pressure metrics, lift, consistency, eligibility and formats. |
| Bowling top 10 | submission/FINAL_TOP_10_BOWLERS.csv | Ordered 1–10 with economy, wickets, strike rate, lift, consistency and formats. |
| Eligibility table | submission/ELIGIBILITY_TABLE.csv | Every scored batter and bowler with matches, pressure balls, innings and status. |
| Evidence file | submission/TOP_10_EVIDENCE.json | Per-player pressure/normal splits, components, context, top innings and bootstrap intervals. |
| Methodology report | submission/FINAL_METHODOLOGY_REPORT.pdf | Print-ready report (this document). |
| Methodology report | submission/FINAL_METHODOLOGY_REPORT.docx | Editable version of this document. |
| Methodology report | submission/FINAL_METHODOLOGY_REPORT.md | Plain-text source with tables and formulas. |
| Audit report | submission/FINAL_AUDIT_REPORT.md | Independent re-implementation, consistency checks and final status. |
| Dashboard | dashboard/ | React/TypeScript application with nine pages, player profiles, charts, filters and CSV downloads. |
| Dashboard data | dashboard/public/data/dashboard.json | Single source of truth for the dashboard; generated by the export script. |
| Charts | submission/charts/ | Eleven report-ready PNG charts generated from the analysis outputs. |
| Tests | tests/ | Automated checks for accounting, rankings, duplicates, eligibility and file consistency. |

*All paths are relative to the project root D:\rr.*

**A note on the numbers in this report.** Every figure is generated from the analysis outputs or recomputed from the cleaned delivery table at build time. The report does not contain hand-typed player statistics. If the pipeline is re-run with the same seed, this document regenerates with the same values. The only exception is the small set of data-quality counts in Section 3, which are documented in `DATA_QUALITY_REPORT.md` and checked by the audit.
