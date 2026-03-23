# WOT brainstorm: scientifically backed measures worth tracking

## Big picture

If WOT is about injury prevention and better load management, the app should be built around one central sport-science idea:

**training stress is not just "what you did", but also "how your body responded."**

That means the app should track both:

- **External load**: the work completed.
- **Internal load**: the athlete's physiological and perceptual response to that work.

This distinction is strongly supported in the training-load literature and is one of the most important design principles for the app.

## Important sport-science concepts

### 1. External load vs internal load

This is the most important conceptual split for the app.

- **External load** = measurable work done, independent of the athlete's response.
  - Examples: duration, distance, pace, speed, power, elevation gain, sets, reps, weight lifted, jump count.
- **Internal load** = how stressful that work was for the athlete.
  - Examples: session RPE, heart rate, heart-rate zones, subjective fatigue, soreness.

Why it matters:

- Two people can do the same workout and experience very different internal loads.
- Different sports use different external-load units, so internal load gives you a shared "currency" across running, cycling, lifting, hiking, team sport, etc.

### 2. Load, recovery, adaptation

Training only works if load is high enough to drive adaptation **and** recoverable enough to absorb.

Useful framing:

- Too little load can limit progress.
- Too much load, especially too quickly, can increase fatigue and injury risk.
- High chronic load is not automatically bad; if built progressively, it may actually be protective.

This is one of the most useful ideas for WOT: the app should not treat all "more training" as dangerous. It should treat **rapid, poorly tolerated change** as the bigger concern.

### 3. Injury risk is multifactorial

This matters a lot for product design.

Injury is not caused by one number. Training load interacts with:

- training history
- previous injury
- sleep
- stress
- recovery
- tissue capacity
- illness
- energy availability
- environment and equipment

So WOT should avoid pretending it can "predict injury" from a single score. A better goal is:

- detect **load trends**
- detect **spikes**
- capture **pain / symptoms early**
- track **recovery context**
- help the user make better decisions

### 4. Subjective measures are not second-class data

A key practical insight from the literature is that simple self-reported measures are often extremely useful.

In real-world monitoring, subjective markers such as:

- perceived exertion
- fatigue
- soreness
- stress
- sleep quality

can be very sensitive to training changes and are often easier to collect consistently than lab-style metrics.

This is great news for an app: a low-friction check-in can be genuinely valuable.

### 5. Trends are more useful than isolated values

Single data points are weak.

What matters more:

- the last 7 days
- the last 28 days
- week-to-week change
- repeated poor sleep
- pain that is trending upward
- high load combined with low readiness

WOT should be designed around **baselines and trends**, not only daily snapshots.

## Measures worth tracking

## A. Universal session-level measures

These are the highest-priority measures because they work across many activity types.

### 1. Session duration

- **Why track it:** basic dose measure; essential for many load calculations.
- **Applies to:** all sports and workouts.
- **Priority:** essential.

### 2. Session RPE (sRPE)

- **What it is:** a 0-10 rating of how hard the whole session felt.
- **Best use:** collected after the session, ideally not in the middle.
- **Why track it:** one of the most practical, validated ways to quantify internal load.
- **Derived metric:** `session load = session duration x sRPE`
- **Priority:** essential.

This is probably the single most valuable common metric for your app if you want one number that can compare a run, a bike ride, and a lifting session.

### 3. Session type / modality

- **Examples:** run, ride, walk, strength, mobility, plyometrics, sport practice, rehab.
- **Why track it:** different external-load measures make sense for different modalities.
- **Priority:** essential.

### 4. Pain during and after session

- **Suggested scale:** 0-10.
- **Why track it:** pain is often a more actionable signal than abstract "readiness."
- **Useful additions:** body area, pain type, whether pain altered training.
- **Priority:** essential for an injury-prevention-focused app.

### 5. Notes on context

- **Examples:** heat, poor sleep, travel, illness, unusual soreness, hard workday, missed meals.
- **Why track it:** helps interpret outliers.
- **Priority:** high, but keep it friction-light.

## B. Modality-specific external load

These make the app actually useful for training analysis.

### Endurance sessions

Track as many of these as are realistically available:

- distance
- moving time
- pace / speed
- elevation gain
- power
- average heart rate
- max heart rate
- time in heart-rate or power zones

Why this matters:

- These variables describe what the athlete actually did.
- External load is especially important when the app connects to wearables or platforms like Strava.

### Strength training sessions

Track:

- exercise name
- sets
- reps
- external load (kg / lb)
- set RPE or reps in reserve (RIR), if the user is advanced enough
- rest time, if easy to capture

Derived metrics worth considering:

- total volume load (`sets x reps x load`)
- hard sets by muscle group
- weekly sets per movement pattern or muscle group
- exposure to heavy loading

Why this matters:

- Strength work is badly represented if you only track duration.
- For injury prevention, the app should know whether the user is exposing tissues to meaningful strength stimulus, not just "did a gym session."

### Plyometric / impact-heavy sessions

Track when possible:

- jump count
- landing count
- sprint count
- acceleration / deceleration count
- contacts

Why this matters:

- Mechanical loading matters, especially for tendon and bone stress.
- This becomes more important if the app eventually supports field sports or jump-heavy training.

## C. Recovery and readiness measures

These should be short, repeatable, and easy to enter.

### 1. Sleep duration

- **Why track it:** sleep is one of the strongest recovery-related measures you can collect at low cost.
- **Priority:** essential.

### 2. Sleep quality

- **Why track it:** sleep quantity and sleep quality are not the same thing.
- **Suggested scale:** 1-5 or 1-10.
- **Priority:** high.

### 3. Fatigue

- **What it captures:** general tiredness / readiness.
- **Suggested scale:** 1-5 or 1-10.
- **Priority:** high.

### 4. Muscle soreness

- **Why track it:** useful for understanding whether the athlete is tolerating recent training.
- **Priority:** high.

### 5. Stress

- **Why track it:** non-training stress contributes to total stress burden.
- **Priority:** high.

### 6. Motivation / willingness to train

- **Why track it:** can sometimes reveal accumulating fatigue earlier than performance data.
- **Priority:** medium to high.

### 7. Illness / injury status

- **Simple flags:** healthy, illness symptoms, modified training, injured, returning from injury.
- **Priority:** essential.

### 8. Menstrual cycle / hormonal-context tracking (optional, user-controlled)

- **Why track it:** can be useful for some users when combined with symptoms, readiness, and training tolerance.
- **Important note:** this should be optional, private, and never overinterpreted.
- **Priority:** optional but meaningful.

### 9. Energy-availability / fueling red flags

Possible low-friction indicators:

- unintentional weight loss
- low appetite
- missed fueling around training
- persistent fatigue
- menstrual disruption (where relevant)

Why this matters:

- Low energy availability / RED-S can affect recovery, bone health, hormonal function, immunity, and performance.
- This is clinically important, but the app should treat it as a **screening / awareness** area, not a diagnosis engine.

## D. Derived metrics worth calculating

These are the analytics layer.

### 1. Session load

`session load = duration x sRPE`

Why it matters:

- Simple
- validated in many settings
- works across modalities
- easy to understand

### 2. Weekly load

`weekly load = sum of all session loads in 7 days`

Why it matters:

- basic view of total stress
- more useful than isolated workouts

### 3. Rolling 28-day load / chronic load

Why it matters:

- helps represent training history
- gives context for whether current load is normal or a spike

### 4. Week-to-week percent change

Why it matters:

- very practical way to identify abrupt changes
- easier to explain to users than more advanced formulas

### 5. Monotony

Classic formulation:

`monotony = mean daily load / standard deviation of daily load`

Why it matters:

- captures how similar each day looks
- high monotony can suggest repeated stress without enough variation

### 6. Strain

Classic formulation:

`strain = weekly load x monotony`

Why it matters:

- combines total load and how repetitive that load was

### 7. Pain trend

Useful examples:

- days with pain > 0
- average weekly pain
- pain spike after specific session types
- body-region-specific pain trend

Why it matters:

- if injury prevention is the goal, symptom trends should sit near the center of the app

### 8. Compliance / consistency

Examples:

- sessions completed vs planned
- number of active days per week
- long gaps between exposures

Why it matters:

- consistency is often safer and more effective than repeated boom-bust cycles

## Metrics to treat cautiously

These are not useless, but they should not become the core of the product without careful framing.

### 1. Acute:chronic workload ratio (ACWR)

Why to be careful:

- It became very popular.
- Some research supports its usefulness.
- But later reviews show variability, methodological issues, and risk of overconfidence.

My take for WOT:

- it is fine to include as an **advanced trend view**
- do **not** market it as a reliable injury predictor
- simpler trend metrics like rolling load and week-to-week change may be more interpretable for most users

### 2. Heart rate variability (HRV)

Why to be careful:

- HRV can be useful
- but interpretation is individual and context-heavy
- it can be noisy, protocol-dependent, and easy to misuse

My take for WOT:

- good candidate for an advanced / wearable-powered feature
- not a great MVP centerpiece

### 3. Single "readiness scores"

Why to be careful:

- they look attractive in apps
- but often hide too much uncertainty

Better approach:

- show the inputs separately
- optionally provide a summary view
- avoid pretending the summary is a diagnosis

## Recommended MVP tracking set

If you want the smallest high-value set, I would start here:

1. session type
2. duration
3. sRPE
4. pain during / after session
5. sleep duration
6. sleep quality
7. fatigue
8. soreness
9. stress
10. illness / injury status
11. modality-specific external metrics
    - endurance: distance + pace/speed + HR if available
    - strength: sets + reps + load

From that, the app can already generate:

- session load
- weekly load
- rolling load
- monotony
- strain
- load spikes
- pain trends
- recovery trend views

## Product design implications for WOT

### 1. Use a common load layer plus sport-specific detail

This fits your README well.

You want one shared cross-sport metric:

- `duration x sRPE`

And then sport-specific external detail:

- running -> distance, pace, elevation, HR
- cycling -> distance, power, HR
- lifting -> sets, reps, load, set effort

That lets different activities "add up" without flattening everything into nonsense.

### 2. Minimize input friction

Science is only useful if the user actually logs the data.

Good candidates for one-tap or low-friction entry:

- sRPE
- pain
- sleep quality
- fatigue
- soreness
- stress

### 3. Show trend dashboards, not just logs

The real value is interpretation:

- "last 7 days vs your usual"
- "pain has increased for 3 sessions in a row"
- "load rose sharply while sleep worsened"
- "strength exposure for calves / hamstrings dropped this month"

### 4. Prefer decision support over prediction claims

Safer language:

- "possible spike in load"
- "recovery has been trending down"
- "watch this symptom trend"

Less safe language:

- "injury risk is 82%"
- "you will get injured if you train tomorrow"

## Reading material

These are the most useful papers / references to shape the product.

### Training load fundamentals

**Foster C, Rodriguez-Marroyo JA, de Koning JJ. _Monitoring Training Loads: The Past, the Present, and the Future._ Int J Sports Physiol Perform. 2017.**

- Why read it: very good overview of internal vs external load, TRIMP, session-RPE, and the practical evolution of load monitoring.

**Borresen J, Lambert MI. _The quantification of training load, the training response and the effect on performance._ Sports Med. 2009.**

- Why read it: broad review of how training load and training response have been quantified.

### Session RPE

**Haddad M, Stylianides G, Djaoui L, Dellal A, Chamari K. _Session-RPE method for training load monitoring: validity, ecological usefulness, and influencing factors._ Front Neurosci. 2017.**

- Why read it: strong review of session-RPE, why it works, and what can distort it.

### Workload and injury

**Gabbett TJ. _The training-injury prevention paradox: should athletes be training smarter and harder?_ Br J Sports Med. 2016.**

- Why read it: important idea that appropriately built high chronic load may be protective, while rapid spikes are the bigger problem.

**Windt J, Gabbett TJ. _How do training and competition workloads relate to injury? The workload-injury aetiology model._ Br J Sports Med. 2017.**

- Why read it: very useful conceptual model showing how load interacts with exposure, fatigue, fitness, and injury risk.

**Maupin D, Schram B, Canetti E, Orr R. _The relationship between acute:chronic workload ratios and injury risk: a systematic review._ Open Access J Sports Med. 2020.**

- Why read it: helpful for understanding both the appeal and the limitations of ACWR.

### Subjective monitoring and recovery

**Saw AE, Main LC, Gastin PB. _Monitoring the athlete training response: subjective self-reported measures trump commonly used objective measures: a systematic review._ Br J Sports Med. 2016.**

- Why read it: one of the most product-relevant papers for app design; supports short, repeatable self-report measures.

**Walsh NP, Halson SL, Sargent C, et al. _Sleep and the athlete: narrative review and 2021 expert consensus recommendations._ Br J Sports Med. 2020.**

- Why read it: excellent evidence-based overview of sleep as a health and performance variable.

### Strength training

**American College of Sports Medicine. _Progression models in resistance training for healthy adults._ Med Sci Sports Exerc. 2009.**

- Why read it: foundational reference for strength-program variables, progression, loading, and volume.

### Energy availability / RED-S

**Mountjoy M, Sundgot-Borgen J, Burke L, et al. _The IOC consensus statement: beyond the Female Athlete Triad--Relative Energy Deficiency in Sport (RED-S)._ Br J Sports Med. 2014.**

- Why read it: foundational document on energy deficiency, with direct implications for recovery, bone health, and long-term athlete health.

**Mountjoy M, Ackerman KE, Bailey DM, et al. _2023 International Olympic Committee's (IOC) consensus statement on Relative Energy Deficiency in Sport (REDs)._ Br J Sports Med. 2023.**

- Why read it: current IOC consensus update.

## My current recommendation

If the app is meant to be practical, cross-sport, and genuinely useful for injury prevention, the center of the product should be:

- **session duration**
- **session RPE**
- **sport-specific external load**
- **pain / symptom tracking**
- **sleep**
- **fatigue / soreness / stress**
- **trend analysis over 7-28 days**

That combination is evidence-aligned, realistic to collect, and much stronger than trying to build the app around a flashy single readiness or injury-risk score.

## Add-on: strength-only regional load model

This is the next layer I would build for your use case.

The main idea:

- keep the global session-load model (`duration x sRPE`)
- add a **strength-specific external-load model**
- split that strength load across body regions using exercise-specific weighting

This is scientifically defensible **as a proxy model**, but not as a direct measurement of tissue stress. That distinction is important.

### Why this makes sense

For strength training, adaptation is related to mechanical overload, total work performed, volume, intensity, and proximity to failure. However, there is no simple field metric that perfectly captures "true" stress on each muscle, tendon, or joint.

So for WOT, the right mindset is:

- do **not** claim exact tissue load
- do build a **consistent regional exposure model**
- use it to spot monotony, underexposure, sudden spikes, and pain-load mismatch

## Recommended body-region map

Your initial list is good, but I would tighten the labels a bit so the model is easier to interpret:

- **arms / elbows**
- **shoulders**
- **chest**
- **hips / glutes**
- **knees / quads**
- **hamstrings / posterior chain**

Why I would rename some of them:

- "knees" is really a region of interest more than a prime mover, so in practice this usually means the **knee extensor chain** and knee-dominant loading.
- "hamstrings" often behaves as part of a broader posterior-chain pattern, especially in hinges and sprint-related work.

You can still show the simpler labels in the UI if you prefer.

## Three levels of strength-load calculation

I would implement this in layers.

### Level 1. Tonnage / volume load

`volume load = external load x reps`

Per session:

`session volume load = sum(load x reps) across all working sets`

Why use it:

- very easy to calculate
- standard and interpretable
- strong practical value

Limitations:

- ignores range of motion
- treats a short-rep bench press and deep squat similarly if kg x reps is the same
- does not account for effort well on its own

### Level 2. Work proxy

`work proxy = external load x displacement x reps`

Per set:

- `external load` in kg
- `displacement` in meters for the concentric phase, ideally exercise-specific
- `reps`

Why use it:

- closer to actual external mechanical work than tonnage alone
- better distinguishes short-ROM from long-ROM lifts

Limitations:

- still incomplete
- ignores some body-mass contribution
- ignores stabilizer demand
- ignores eccentric loading complexity
- depends on having a decent displacement estimate

### Level 3. Effort-adjusted work proxy

If you want a better training-stress estimate for strength, I would not stop at `kg x meters x reps`.

I would multiply by an effort factor:

`effort-adjusted load = load x displacement x reps x effort factor`

Possible effort-factor options:

- set RPE-based
- RIR-based
- %1RM-based

Example of a simple RIR factor:

- 0-1 RIR -> `1.00`
- 2 RIR -> `0.95`
- 3 RIR -> `0.90`
- 4+ RIR -> `0.80`

This is not a validated universal scale, but it is a reasonable product model because it acknowledges that:

- 3 x 10 at 2 RIR is not the same stimulus as 3 x 10 at 6 RIR
- effort matters in resistance training

## My recommended WOT formula

For a practical first version, I would calculate **two parallel strength metrics**:

### 1. Simple volume load

`simple strength load = sum(load x reps)`

Use this because it is robust and low-friction.

### 2. Regional work proxy

`regional set load = load x displacement x reps x region weight x effort factor`

Then:

`regional weekly load = sum(regional set loads over 7 days)`

This lets you have:

- a simple total strength-load number
- a more detailed body-region allocation model

## Exercise-to-region weighting

This is the key piece.

For each exercise, assign percentages to regions. The weights should sum to `1.0`.

Example:

### Barbell bench press

- chest -> `0.45`
- shoulders -> `0.30`
- arms / elbows -> `0.25`

### Overhead press

- shoulders -> `0.50`
- arms / elbows -> `0.25`
- chest -> `0.10`
- hips / glutes -> `0.05`
- knees / quads -> `0.05`
- hamstrings / posterior chain -> `0.05`

### Back squat

- knees / quads -> `0.40`
- hips / glutes -> `0.35`
- hamstrings / posterior chain -> `0.15`
- shoulders -> `0.05`
- arms / elbows -> `0.05`

### Romanian deadlift

- hamstrings / posterior chain -> `0.45`
- hips / glutes -> `0.35`
- shoulders -> `0.10`
- arms / elbows -> `0.10`

### Pull-up / chin-up

- arms / elbows -> `0.40`
- shoulders -> `0.30`
- chest -> `0.05`
- hips / glutes -> `0.10`
- hamstrings / posterior chain -> `0.15`

These numbers are not "truth." They are structured heuristics.

That is okay.

If the model is internally consistent, it becomes very useful for:

- comparing weeks
- spotting spikes
- spotting neglected regions
- identifying repetitive loading patterns

## Displacement values

If you want `load x distance`, you need standard displacement estimates.

You have three implementation options:

### Option A. Fixed exercise defaults

Example:

- bench press -> `0.40 m`
- squat -> `0.55 m`
- RDL -> `0.45 m`
- overhead press -> `0.50 m`

Pros:

- simple
- good enough for trend tracking

Cons:

- not individualized

### Option B. User-specific default by body size

Estimate displacement using:

- user height
- limb-length heuristics
- exercise variation

Pros:

- more personalized

Cons:

- more complexity
- still an estimate

### Option C. Technique-specific or wearable-derived bar path

Pros:

- most realistic

Cons:

- too complex for an early product

My recommendation:

- start with **fixed exercise defaults**
- maybe later offer user-adjustable ROM presets

## Important caveat: body mass matters for some lifts

For bodyweight and mixed-loading exercises, using only external load can undercount stress.

Examples:

- push-up
- pull-up
- dip
- split squat
- lunge

For these, a better estimate is:

`effective load = external load + body-mass fraction`

Example rules:

- push-up -> use about `0.60-0.70 x body mass`
- pull-up -> use about `1.00 x body mass + added load`
- dip -> use about `1.00 x body mass + added load`
- split squat / lunge -> use external load plus a chosen fraction of body mass

These are still heuristics, but they are better than ignoring body mass completely.

## Regional monotony and variety

This is where your idea gets really interesting.

Instead of only calculating monotony on total weekly load, calculate it **per region**.

### Regional monotony

For each region:

`regional monotony = mean daily regional load / SD of daily regional load`

Interpretation:

- high value = the same region gets loaded in a very similar way every day
- low value = more variation across the week

This is useful because you may not be globally monotonous, but you may still be hammering one region repeatedly.

Example:

- total training looks varied
- but shoulders are getting high load 5-6 days per week
- pain trend starts rising

That is exactly the kind of thing WOT should reveal.

### Regional strain

`regional strain = weekly regional load x regional monotony`

This is probably one of the best metrics for your specific use case.

It highlights:

- heavily loaded regions
- with low day-to-day variation

### Exposure gaps

Also track the opposite problem:

- no knee-dominant loading for 14 days
- no hamstring exposure for 10 days
- no horizontal press work for 3 weeks

This matters because injury prevention is not only about avoiding overload. It is also about avoiding **underprepared tissues**.

## When to deload or change the training regime

There is no universal "scientific" threshold that says deload on exactly one number. For real-world coaching, I would use **stacked signals** instead of a single cutoff.

### Good deload / pivot signals

I would flag a region or a whole program when several of these happen together:

- weekly load is high relative to the last 4 weeks
- regional monotony stays high
- regional strain is climbing
- pain in that region trends upward
- performance stalls or drops
- session RPE is rising for the same loads
- fatigue / soreness / sleep are getting worse
- motivation is dropping

This is stronger than reacting to one bad day.

### Practical WOT rule set

I would consider these product rules:

#### Suggest a deload week when:

- total strength load is unusually high for the athlete's baseline **and**
- at least 2 recovery markers worsen **or**
- 1 body region shows high strain plus rising pain

#### Suggest more variety when:

- regional monotony is high for 2+ weeks
- the same movement pattern dominates most sessions
- pain is not yet high, but exposure diversity is low

#### Suggest a tissue-specific pivot when:

- one region's load spikes versus its own 28-day baseline
- pain rises in that same region
- the current program keeps repeating the same exercise family

Example output:

- "Shoulder load has been high and repetitive for 12 days; consider reducing pressing volume or swapping in lower-irritation variations."
- "Hamstring exposure has been low for 2 weeks; consider reintroducing hinge work progressively."

## MVP recommendation for this feature

If you want a first version that is useful without becoming fake-precise, I would build:

1. exercise library with default displacement values
2. exercise library with region weights
3. per-set logging:
   - load
   - reps
   - optional RPE or RIR
4. calculated outputs:
   - total volume load
   - total work proxy
   - regional weekly load
   - regional monotony
   - regional strain
   - regional pain overlay

That is enough to support deload and variety decisions.

## Suggested strength-specific reading additions

**Roberts MD, McCarthy JJ, Hornberger TA, et al. _Mechanisms of mechanical overload-induced skeletal muscle hypertrophy: current understanding and future directions._ Physiol Rev. 2023.**

- Why read it: strong modern review on why mechanical overload matters in resistance training.

**Schoenfeld BJ, Ogborn D, Krieger JW. _Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis._ J Sports Sci. 2017.**

- Why read it: useful for thinking about weekly regional exposure and volume progression.

**Williams TD, Tolusso DV, Fedewa MV, Esco MR. _Comparison of Periodized and Non-Periodized Resistance Training on Maximal Strength: A Meta-Analysis._ Sports Med. 2017.**

- Why read it: helpful background for why planned variation and phased loading can outperform doing the same thing continuously.

## My recommendation for your specific idea

Yes, I think you should build this.

But I would frame it as:

- **regional strength exposure**
- **regional work proxy**
- **regional monotony / strain**

rather than:

- "exact tissue load"

That wording is more honest scientifically and still very useful in practice.
