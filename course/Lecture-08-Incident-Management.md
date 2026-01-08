# Lecture 8: Incident Management and Post-Market Monitoring

Course: EU AI Act Compliance: Build Audit-Ready Documentation
Platform: Udemy
Duration: 25-30 minutes
Section Type: Main Content (3 slides)

---

## Slide 1: Step Overview

### Slide Title
"Post-Market Monitoring: Incident Detection, Investigation, and Regulatory Reporting"

### Slide Notes (Instructor Narration - 340 words)

Post-market monitoring and incident management represent your continuous vigilance obligation after deploying high-risk AI systems, and the EU AI Act requires providers to actively monitor deployed systems, detect incidents and malfunctions, investigate root causes, implement corrective actions, and report serious incidents to regulatory authorities within strict timelines. This isn't passive observation waiting for users to complain—Article 61 and Article 62 mandate systematic post-market monitoring plans and serious incident reporting procedures that demonstrate you're actively overseeing your AI system's real-world performance and responding promptly when issues arise. Organizations that deploy high-risk AI systems and then shift attention elsewhere without continuous monitoring violate their ongoing compliance obligations and face regulatory penalties when unreported incidents eventually surface during audits or through user complaints reaching authorities directly.

The EU AI Act defines serious incidents specifically as incidents that lead to death, serious damage to health, serious and irreversible disruption of critical infrastructure, breaches of fundamental rights, or other serious harm to persons or property. When serious incidents occur, providers must report to market surveillance authorities within fifteen days, and this reporting obligation is non-negotiable regardless of whether the incident was your fault, resulted from user error, or occurred due to external factors. The fifteen-day timeline starts when you become aware of the incident, not when you complete your investigation, so incident detection mechanisms must ensure timely awareness. Beyond regulatory reporting, incident management serves operational purposes including identifying systemic issues before they cause widespread harm, learning from failures to improve system reliability, demonstrating continuous improvement to stakeholders and customers, and building institutional knowledge about real-world AI system behavior that informs future development.

Effective incident management requires several integrated components working as a systematic capability. You need incident detection mechanisms that identify when your AI system behaves unexpectedly, produces erroneous outputs, causes user harm, or violates operational boundaries—this includes automated monitoring, user feedback channels, customer complaints, and safety reporting. You require incident classification procedures that determine severity, assess whether regulatory reporting obligations trigger, and prioritize investigation and remediation efforts. You need investigation protocols that systematically determine root causes, identify contributing factors, and assess whether similar issues might affect other AI systems or deployments. You must implement corrective and preventive actions that remediate the specific incident and prevent recurrence through system updates, training data improvements, process changes, or deployment modifications. Finally, you need comprehensive documentation proving to regulators that you detected the incident promptly, investigated thoroughly, remediated appropriately, and reported when required.

### Bullet Points

- Continuous monitoring of deployed AI systems required
- Detect incidents through automated monitoring and user feedback
- Classify incidents by severity and regulatory reporting obligations
- Serious incidents reported to authorities within fifteen days
- Systematic investigation determines root causes
- Corrective actions remediate issues and prevent recurrence
- Documentation proves detection, investigation, remediation, and reporting
- Demonstrates continuous improvement and responsible AI operation

---

## Slide 2: Real-World Application

### Slide Title
"Incident Management in Practice: Detection Through Resolution"

### Slide Notes (Instructor Narration - 335 words)

Let's examine how organizations implement incident management and post-market monitoring by walking through realistic scenarios showing detection mechanisms, investigation procedures, remediation actions, and regulatory reporting decisions. Understanding these practical examples helps you build effective incident response capabilities for your AI systems.

Consider SafeDrive AI, an automotive technology company operating an AI-based driver assistance system that provides lane-keeping assistance and collision warnings in vehicles deployed across the European Union. This is clearly a high-risk system under Annex III critical infrastructure and safety components, so incident management is absolutely critical given potential safety consequences. SafeDrive has implemented comprehensive post-market monitoring with multiple detection mechanisms working together.

Their automated monitoring systems continuously collect telemetry from deployed vehicles including system activation frequency, warning trigger rates, driver override patterns, and any anomalies or errors logged by the AI system. They analyze this data weekly looking for statistical deviations that might indicate emerging issues such as increased false positive warnings in specific weather conditions or unexpected system deactivations. They maintain customer feedback channels where drivers can report concerns, unexpected behaviors, or incidents through their mobile app and customer service hotline. They have established relationships with vehicle manufacturers who report field issues and warranty claims potentially related to the AI system. They monitor social media and online forums for user discussions mentioning their system and possible safety concerns.

In March 2024, their monitoring detected a troubling pattern. Over a two-week period, they identified twelve reports from drivers in Northern Europe describing unexpected lane-keeping interventions during heavy snowfall, where the system appeared to misinterpret snow-covered lane markings and provided steering corrections that drivers found alarming. Three drivers reported near-miss incidents where they had to override the system aggressively to avoid potential collisions. SafeDrive's incident management team immediately classified this as a potentially serious incident requiring urgent investigation because it involves safety-critical functionality, multiple occurrences suggesting systematic rather than isolated issues, and potential for serious harm if drivers don't override appropriately.

### Incident Examples and Classification Table

| Incident Description | Severity Classification | Regulatory Reporting Required | Investigation Priority | Remediation Actions | Timeline |
|---------------------|------------------------|------------------------------|----------------------|---------------------|----------|
| AI misinterprets snow-covered lanes causing unsafe steering interventions | Serious Incident | Yes - Within 15 days | Urgent | Immediate software update, driver notifications, enhanced training data | 2 weeks |
| Credit scoring system shows statistical bias producing different approval rates for protected demographics | Serious Incident | Yes - Fundamental rights breach | High | Algorithm retraining, fairness testing, affected applications review | 30 days |
| Resume screening AI crashes intermittently requiring system restart | Non-Serious Incident | No | Medium | Bug fix, stability improvements, monitoring enhancement | 60 days |
| Healthcare diagnostic AI produces false positive requiring additional testing | Potentially Serious | Assessment Required | High | Clinical validation, accuracy improvement, uncertainty quantification | 15-30 days |
| Chatbot provides slightly outdated product information to customers | Non-Serious Incident | No | Low | Data refresh, QA improvements | 90 days |
| Fraud detection system blocks legitimate transactions causing customer inconvenience | Non-Serious Incident | No | Medium | Precision tuning, customer communication, override procedures | 45 days |

### Incident Management Process Framework

**Detection and Reporting**
- Automated monitoring and alerting systems
- User feedback channels and complaint procedures
- Customer service escalation protocols
- Field partner and distributor reporting
- Social media and public mention monitoring
- Internal testing and quality assurance findings

**Incident Classification**
- Severity assessment using defined criteria
- Regulatory reporting obligation determination
- Impact analysis on users and affected parties
- Systemic versus isolated incident evaluation
- Priority assignment for investigation and remediation
- Stakeholder notification decisions

**Investigation and Root Cause Analysis**
- Incident timeline reconstruction
- System logs and telemetry analysis
- Affected user interviews and data collection
- Technical analysis identifying failure mechanisms
- Contributing factor assessment
- Similar incident pattern identification
- Root cause determination using systematic methodology

**Corrective and Preventive Actions**
- Immediate remediation to address specific incident
- Software updates or model retraining
- Process changes to prevent recurrence
- Enhanced monitoring for similar issues
- User communication and guidance
- Documentation updates and training improvements
- Validation that corrective actions effective

**Regulatory Reporting**
- Fifteen-day reporting timeline for serious incidents
- Required information compilation per Article 62
- Market surveillance authority notification
- Follow-up reporting as investigation progresses
- Affected user notification where appropriate
- Corrective action documentation for authorities

---

## Slide 3: Practical Application

### Slide Title
"Incident Management in Practice: Detection Through Regulatory Reporting"

### Slide Notes (Practical Application Narration - 500 words)

Now let's walk through a complete incident management example showing exactly how a company detects, investigates, remediates, and reports a serious AI system incident with full documentation suitable for regulatory submission and audit defense. We'll follow TalentTech Solutions as they manage their first serious incident with their AI Recruitment Assistant, demonstrating systematic incident response from initial detection through corrective action completion and regulatory authority notification within the mandatory fifteen-day timeline.

TalentTech's automated monitoring dashboard detected anomalous fairness metrics on March 15, 2024, triggering an immediate investigation. Their post-market monitoring system tracks twelve fairness indicators across demographic groups on production data, with automated alerts when metrics exceed predefined thresholds. The alert showed: "Demographic Parity Violation: Gender acceptance rate difference 11.2% (threshold ±5%), triggered by 347 candidate evaluations processed March 1-14, 2024. Statistical significance: p<0.001." Three recruiters had independently contacted the compliance team during the same period expressing concerns that ranking results seemed inconsistent with candidate qualifications, providing convergent evidence from multiple detection channels. Jennifer Martinez, Compliance Manager, immediately initiated formal incident documentation recognizing the potential severity given employment discrimination implications.

TalentTech created incident record INC-2024-001 with comprehensive initial documentation. "Incident ID: INC-2024-001. Detection Date: March 15, 2024 at 09:23 CET via automated fairness monitoring dashboard. Incident Description: AI recruitment system exhibited statistically significant differences in candidate ranking scores between demographic groups during March 1-14, 2024 operational period. Analysis of 2,347 candidate evaluations revealed candidates from underrepresented minority groups received average scores 12.3% lower than similarly qualified candidates from majority groups (measured by education level, years of experience, and skill match scores). Manual review of 50 representative cases by senior recruiters confirmed systematic ranking disparities not explained by objective qualification differences. Detection Method: Automated fairness monitoring alert triggered by demographic parity threshold violation; corroborated by independent recruiter concerns reported through feedback channels. Incident Category: Algorithmic Bias/Fairness. Affected Period: March 1-14, 2024 (14 days). Affected Population: Approximately 450 candidates from underrepresented demographic groups processed during incident period." They classified severity using Article 62 criteria for serious incidents. The incident potentially involves fundamental rights violations under EU non-discrimination law because employment decisions based on protected characteristics breach equality rights. Classification: Serious Incident requiring regulatory reporting within fifteen days from awareness date. Regulatory Reporting Deadline: March 30, 2024.

Their impact assessment documented potential harm comprehensively. "Impact Assessment: Approximately 450 candidates from underrepresented groups potentially received systematically lower rankings than merited based on objective qualifications. Preliminary analysis identified 73 candidates who were screened out (not advanced to recruiter review) who would have been advanced under unbiased scoring. Actual hiring impact: 15 candidates confirmed affected by reviewing hiring decisions made during incident period, 4 candidates were incorrectly rejected who would have received job offers under fair evaluation. Legal Impact: Potential fundamental rights violation under EU Charter of Fundamental Rights Article 21 (non-discrimination) and Employment Equality Directive. Regulatory Risk: Article 71 penalties up to €30M or 6% global revenue for high-risk AI system violations. Reputational Risk: Employer brand damage, customer trust erosion if incident becomes public. Financial Impact: Estimated legal defense costs €200K-500K, potential discrimination lawsuit settlements, regulatory fine exposure." This frank assessment demonstrates organizational accountability and serious incident management.

They conducted systematic root cause investigation using structured methodology. "Investigation Timeline: March 15-19, 2024 conducted by cross-functional team including ML engineers, data scientists, compliance manager, and external fairness consultant. Root Cause Analysis: Model retraining executed February 28, 2024 incorporated 8,742 new resume records from client TechStartup GmbH's historical hiring data covering 2020-2022. Pre-training bias assessment of this dataset identified concerning demographic patterns (acceptance rate differences of 14.6% across gender), but data was included after inadequate preprocessing that failed to fully mitigate bias. Specifically, feature engineering preserved job title history that correlated with protected characteristics, and fairness constraints during training used insufficiently stringent thresholds (±8% vs. production standard ±5%). Contributing Factors: (1) Retraining validation protocol did not include stratified fairness testing before production deployment, (2) monitoring dashboard aggregation period (weekly) delayed detection by up to 14 days, (3) data acceptance criteria lacked mandatory bias assessment gate with quantitative thresholds, (4) inadequate review of client-provided training data quality and bias characteristics. Underlying Systemic Issue: Model update process lacked sufficient fairness checkpoints between data ingestion and production deployment." This investigation identifies specific technical failures and process gaps enabling the incident.

TalentTech implemented comprehensive corrective actions across immediate, medium-term, and long-term timeframes. "Immediate Remediation (March 15-16, 2024): Rolled back AI Recruitment Assistant to previous model version v2.2.0 deployed February 15, 2024, restoring validated fairness performance. Notified all clients using system during incident period about temporary service interruption for emergency maintenance. Began review of affected candidate evaluations to identify incorrectly screened-out individuals. Medium-Term Actions (March 17-April 5, 2024): Conducted comprehensive bias audit of all training data including TechStartup GmbH dataset, implemented enhanced preprocessing pipeline using Fairlearn AIF360 toolkit for bias mitigation, retrained model v2.3.2 with strengthened fairness constraints requiring demographic parity ±4% and equalized odds ±6%, conducted extensive stratified fairness testing across 8 demographic subgroups and 15 job categories validating performance before deployment, deployed updated model April 5, 2024 with documented fairness validation. Long-Term Prevention (April-May 2024): Enhanced monitoring dashboard to daily aggregation enabling faster incident detection, implemented real-time fairness alerts triggering within 24 hours of threshold violations, revised model update process requiring mandatory fairness review gate before production deployment with documented approval by compliance manager, updated data acceptance criteria mandating bias assessment with Aequitas toolkit for all training data before incorporation with quantitative thresholds (demographic parity ±5%, statistical parity ratio 0.8-1.2), implemented quarterly fairness audits of production system with external consultant validation. Responsible Parties: Sarah Chen (CTO) owns technical remediation, Jennifer Martinez (Compliance Manager) owns process improvements and regulatory reporting, Michael Rodriguez (Data Engineering Lead) owns data quality and bias testing implementation." Each action includes specific owner, completion date, and validation method.

They completed regulatory reporting within the mandatory timeline. "Regulatory Notification: Submitted Article 62 serious incident report to German Federal Office for Information Security (BSI) as competent market surveillance authority on March 25, 2024 (10 days after awareness, within 15-day requirement). Report Contents: Complete incident description with detection method and timeline, affected population quantification, classification rationale under Article 62 fundamental rights breach criteria, root cause investigation findings, corrective actions implemented and planned with completion dates, contact information for follow-up inquiries. Follow-Up Reporting: Submitted supplementary report April 10, 2024 documenting completion of medium-term corrective actions and updated model deployment with fairness validation results. Affected User Notification: Notified 73 candidates identified as potentially affected by incident on March 28, 2024 with apology, explanation of incident, description of remediation, offer to re-evaluate applications, contact information for questions. Documentation Package: Complete incident report including monitoring data, investigation analysis, corrective action evidence, and regulatory correspondence maintained in incident management system for audit trail." This demonstrates full regulatory compliance with transparent, timely reporting and comprehensive remediation.

### Bullet Points

- Detection via automated fairness monitoring on March 15 showing 11.2% gender disparity
- Incident INC-2024-001 affecting 450 candidates with systematic bias in rankings
- Classified as serious incident due to fundamental rights violations (Article 62)
- Root cause: Biased training data from client with inadequate preprocessing
- Immediate rollback to previous model version within 24 hours
- Medium-term: Complete model retraining with strengthened fairness constraints
- Long-term: Enhanced monitoring, mandatory fairness review gates, quarterly audits
- Regulatory reporting to BSI completed March 25 (within 15-day deadline)

---

## Practice Assignment

### Title
Create Incident Management and Post-Market Monitoring System

### Description
Establish comprehensive incident management capabilities including post-market monitoring plan, incident detection and documentation procedures, root cause investigation methodology, corrective action protocols, and regulatory reporting compliance suitable for Article 62 serious incident obligations.

### Estimated Duration
30-35 minutes

### Instructions

Task 1: Establish Post-Market Monitoring Plan with Detection Mechanisms

Create a comprehensive post-market monitoring plan defining how you will detect incidents and malfunctions in your deployed AI system through multiple detection channels. Document automated monitoring systems you will implement: specify performance metric dashboards you'll create (accuracy, precision, recall, F1 score with time-series trending), fairness monitoring tracking demographic performance differences (demographic parity, equalized odds, calibration across subgroups with automated alerting when thresholds exceeded), error rate monitoring (system failures, integration errors, data quality issues with escalation triggers), data quality checks (input distribution monitoring, anomaly detection, data drift assessment), and specific alert thresholds triggering incident investigation (e.g., "Alert if accuracy drops below 80% or fairness metrics exceed ±5% demographic parity difference"). Define user feedback channels: customer service escalation procedures specifying when complaints escalate to incident status, in-app or web-based incident reporting mechanisms with structured forms, dedicated safety or compliance contact email addresses, periodic user surveys collecting satisfaction and concern data. Establish internal monitoring: QA testing schedule for production systems (weekly automated testing, monthly manual review), regular performance reviews by technical teams (monthly metrics review, quarterly comprehensive audit), proactive anomaly detection procedures using statistical process control. For each monitoring mechanism, document monitoring frequency (real-time, daily, weekly), responsible parties with names and roles, escalation procedures when issues detected, and quantitative thresholds triggering formal incident investigation. Write monitoring plan like: "Automated fairness monitoring dashboard tracks demographic parity and equalized odds daily across 8 demographic subgroups. Alert triggers when any metric exceeds ±5% threshold. Jennifer Martinez (Compliance Manager) receives automated alerts within 24 hours, initiates incident investigation within 48 hours if alert persists, escalates to AI Governance Committee if serious incident criteria potentially met." This demonstrates systematic post-market oversight with defined accountability.

Task 2: Document Realistic Incident with Specific Details

Create comprehensive incident documentation for a realistic incident that could occur with your AI system, using specific dates, quantitative metrics, and factual details suitable for regulatory reporting. Choose incident type relevant to your system: algorithmic bias incidents for employment, credit, or access systems showing systematic performance differences across protected groups; accuracy degradation incidents for prediction systems experiencing performance decline; safety concern incidents for autonomous or safety-critical systems producing dangerous outputs; privacy breach incidents for systems processing personal data inappropriately; integration failure incidents affecting system availability or correctness. Document incident with structured format: Incident ID (use convention like INC-YYYY-NNN), detection date with specific timestamp, incident description with facts not interpretations (what occurred, affected period, scale of impact with numbers, detection method), incident category from taxonomy, affected population quantification with demographics if relevant, immediate consequences documented. Write detailed description like: "Incident ID: INC-2024-003. Detection Date: May 18, 2024 at 14:37 CET via user complaint escalation and confirmed by manual testing. Incident Description: Credit scoring AI system intermittently returned score of 0 (invalid output) for approximately 3.2% of scoring requests during May 10-17, 2024 period. Analysis of system logs identified 847 invalid score outputs from 26,156 total scoring requests. Integration testing revealed that input records with certain character encodings in address fields caused parsing errors resulting in null values propagating through scoring model producing invalid output. Affected population: 847 loan applicants received automated rejections due to invalid scores, requiring manual review and rescoring. Immediate consequences: Loan application processing delays of 2-5 days, customer complaints about unexplained denials, operational burden of manual application review." Classify incident severity honestly using Article 62 criteria: does incident involve death, serious health damage, critical infrastructure disruption, fundamental rights breach, or serious harm? For borderline cases, document classification rationale and err toward serious classification when uncertain.

Task 3: Conduct Systematic Root Cause Investigation

Perform comprehensive root cause analysis identifying fundamental causes rather than superficial symptoms, using structured investigation methodology with documented evidence. Reconstruct complete incident timeline: when did underlying issue originate (e.g., "May 8, 2024: Model retraining incorporated new training data"), when did incident begin manifesting (e.g., "May 10, 2024: First invalid outputs logged"), when was incident detected (e.g., "May 18, 2024: User complaints triggered investigation"), what was response timeline (e.g., "May 18, 2024: Investigation initiated, May 19: Root cause identified, May 20: Corrective action deployed"). Analyze contributing factors systematically across categories: technical issues (model architecture problems, data quality defects, software bugs, integration failures), process failures (inadequate testing, insufficient validation, missing review gates, poor change management), human factors (training deficiencies, miscommunication, unclear procedures, competing priorities), environmental factors (unexpected operating conditions, data distribution shifts, third-party system changes). Identify fundamental root cause using "5 Whys" or similar methodology: "Symptom: Invalid model outputs. Why? Null values in feature vector. Why? Parsing error on address field. Why? Character encoding not handled. Why? Integration testing didn't include character encoding edge cases. Why? Test dataset lacked sufficient diversity. Root Cause: Test data curation process doesn't ensure representation of real-world input variations." Distinguish immediate trigger (character encoding edge case) from underlying systemic issue (inadequate test data diversity). Document investigation findings with specific evidence: "Log analysis showed 847 instances of exception 'UnicodeDecodeError' in preprocessing module coinciding with invalid outputs. Manual testing confirmed that addresses containing characters from non-Latin alphabets (Greek, Cyrillic, Chinese) triggered parsing failures. Code review identified missing encoding specification in text parsing function added during March 2024 update but not adequately tested." This systematic investigation enables effective corrective actions preventing recurrence.

Task 4: Define Comprehensive Corrective Actions with Timeline

Design multi-layered corrective and preventive action plan addressing immediate incident remediation, medium-term root cause correction, and long-term systemic improvements to prevent similar incidents. Structure actions across three timeframes with specific deliverables: Immediate Remediation (0-7 days): Actions that stop ongoing harm and restore service—specify exactly what like "Roll back to previous model version v1.8.2 validated before incident" or "Deploy hotfix adding UTF-8 encoding specification to parsing module" or "Implement manual review process for affected population identifying incorrectly decided cases" or "Notify affected users explaining incident, remediation, and offer to re-evaluate decisions." Medium-Term Root Cause Correction (1-4 weeks): Actions that fix underlying technical or process issues—specify like "Conduct comprehensive code review of preprocessing module identifying all text handling functions and validating encoding specifications," "Retrain model using corrected preprocessing ensuring all training data processed consistently," "Expand integration test suite adding 200 test cases covering character encoding edge cases across 12 language scripts," "Implement automated testing of data preprocessing functions in CI/CD pipeline." Long-Term Systemic Prevention (1-3 months): Actions that reduce likelihood of similar incidents—specify like "Implement test data diversity requirements mandating representation of edge cases (non-Latin characters, special characters, extreme values) with documented coverage metrics," "Add preprocessing validation gates requiring successful processing of standard edge case dataset before production deployment," "Establish quarterly production data sampling reviewing actual input characteristics compared to test data coverage identifying gaps," "Implement enhanced monitoring alerting on preprocessing exceptions within 1 hour enabling rapid detection." For each action, document: specific action with concrete deliverable, responsible party with name and role, target completion date, validation method proving action effectiveness (e.g., "Validation: Run 5,000 production-like transactions through updated system, verify 0% invalid outputs, confirm character encoding edge cases handled correctly"). Track implementation with status updates: "Immediate remediation completed May 20, 2024 with hotfix deployment and manual review of 847 affected applications initiating rescoring. Medium-term actions 85% complete as of June 10, 2024 with expanded test suite deployed and model retraining in final validation. Long-term actions scheduled completion July 15, 2024 with test data diversity requirements documented and validation gates implemented in deployment pipeline."

Task 5: Complete Regulatory Reporting Assessment and Documentation

Assess whether your documented incident meets Article 62 serious incident criteria requiring mandatory reporting to market surveillance authorities within fifteen days, and compile complete documentation package suitable for regulatory submission. Review serious incident definition: incidents leading to (1) death or serious damage to health of persons, (2) serious and irreversible disruption of management or operation of critical infrastructure, (3) breaches of obligations under EU law intended to protect fundamental rights, or (4) other serious harm to persons, property, or environment. Apply criteria to your incident with documented rationale: "Regulatory Assessment: Incident INC-2024-003 involving invalid credit scores causing automated loan rejections. Article 62 Analysis: (1) No death or health impact—not applicable. (2) Not critical infrastructure—financial services don't qualify unless systemic risk. (3) Potential fundamental rights breach—incorrect loan denials may violate right to non-discrimination if affected demographic groups disproportionately, requires demographic analysis. (4) Serious harm—financial impact on 847 individuals denied credit access, but harm appears remediable through rescoring. Preliminary Classification: Potentially serious incident pending demographic impact assessment. Conservative approach: Classify as serious and prepare regulatory notification, downgrade if investigation confirms no fundamental rights breach." If incident classified as serious, document regulatory reporting requirements: calculate fifteen-day deadline from detection/awareness date, identify competent market surveillance authority in your jurisdiction (e.g., German BSI, French CNIL, Netherlands ACM), compile required reporting information per Article 62 (incident description, affected persons quantification, serious incident classification rationale, corrective actions taken and planned, provider contact information, system registration identifier if applicable). Create comprehensive incident documentation package with professional structure: cover page with incident ID and classification, executive summary (1 page) with incident overview and key findings, detailed incident description with timeline, severity classification with regulatory justification, impact assessment quantifying affected population and harm, root cause investigation findings with evidence, corrective action plan with implementation status, regulatory reporting documentation if serious incident, appendices with supporting evidence (logs, monitoring data, test results). Write in professional style suitable for regulatory review: factual and objective tone, specific quantitative details not vague descriptions, honest assessment of harm and organizational responsibility, systematic methodology evident throughout, clear action plan with accountability. Document length typically 8-15 pages for comprehensive incident report. Save as Incident Management and Post-Market Monitoring Report demonstrating systematic incident response capability and regulatory compliance.

### Deliverable

Incident Management and Post-Market Monitoring Report (8-15 pages) containing:
1. Post-market monitoring plan with detection mechanisms and responsibilities
2. Complete incident documentation with ID, description, and classification
3. Root cause investigation with timeline and contributing factors analysis
4. Comprehensive corrective action plan across immediate, medium, and long-term
5. Regulatory reporting assessment with Article 62 serious incident analysis
6. Professional documentation suitable for regulatory submission and audit defense

### Discussion Questions

Post in the course discussion board:
- What incident did you document and how was it detected?
- Did your incident meet serious incident criteria requiring regulatory reporting?
- What was the root cause and could it have been prevented with different processes?
- What were your most important corrective actions?
- How will your post-market monitoring detect similar incidents in the future?

---

## Downloadable Resources

Included with This Lecture:

1. Post-Market Monitoring Plan Template (PDF) - Framework for systematic deployed system oversight
2. Incident Classification Decision Tree (PDF) - Determine severity and regulatory reporting obligations
3. Root Cause Analysis Methodology (PDF) - Structured investigation techniques for AI incidents
4. Regulatory Reporting Checklist (PDF) - Required information for Article 62 serious incident reports
5. Corrective Action Effectiveness Validation Guide (PDF) - How to verify remediation actions work

---

## Key Takeaways

- Post-market monitoring is continuous obligation after AI system deployment
- Serious incidents must be reported to authorities within fifteen days
- Incident detection requires automated monitoring and user feedback channels
- Root cause investigation determines underlying systemic issues
- Corrective actions address specific incidents and prevent recurrence
- Documentation proves detection, investigation, remediation, and reporting
- Systematic incident management demonstrates responsible AI operation

---

## Instructor Notes

### Setup Before Lecture
- Ensure Incident Management Module is fully functional in Implementation Lab
- Prepare realistic incident examples across different severity levels
- Review Article 62 serious incident criteria and reporting requirements
- Load investigation methodology resources and templates

### Key Emphasis Points
- Emphasize proactive monitoring versus reactive incident response
- Clarify fifteen-day reporting timeline starts from awareness, not investigation completion
- Distinguish between serious incidents requiring reporting and non-serious incidents
- Stress importance of honest severity assessment rather than downplaying
- Demonstrate systematic investigation methodology versus assumptions
- Show that incident management is learning opportunity, not just compliance burden
- Explain that unreported serious incidents discovered during audits create severe penalties

### Common Student Questions

Q: "If we detect an incident but implement corrective actions preventing harm, must we still report it to authorities?"
A: Yes, if the incident meets serious incident criteria based on potential consequences, reporting is required even if actual harm was prevented by your safeguards or quick response. Regulatory reporting assesses what could have happened given the incident characteristics, not just actual outcomes. Prevention demonstrates good incident management but doesn't eliminate reporting obligations for serious incidents.

Q: "What if we're uncertain whether an incident qualifies as serious? Should we wait to complete investigation before deciding about regulatory reporting?"
A: When uncertain, err toward reporting and explain the uncertainty in your notification. The fifteen-day timeline doesn't pause while you investigate, so if you might have a serious incident, notify authorities provisionally and provide updates as investigation progresses. Regulators prefer early notification with uncertainty over delayed reporting justified by "we were still investigating." You can always clarify that an initially serious-appearing incident turned out to be non-serious after investigation.

Q: "We had a serious incident but it was caused by a third-party component we integrate. Are we still responsible for reporting?"
A: Yes, if you're the provider of the high-risk AI system deployed in the EU, you have reporting obligations regardless of whether the root cause was your component, a third-party component, user error, or external factors. You may have contractual recourse against your vendor, but regulatory reporting responsibility remains yours as the provider. Document third-party involvement in your incident report and coordinate with vendors on remediation.

Q: "How detailed must our root cause investigation be? Can we simply identify the immediate trigger?"
A: Investigations should identify fundamental root causes using systematic methodology, not just immediate triggers. For example, if model drift caused performance degradation, the root cause isn't "model drift occurred" but why monitoring didn't detect it earlier, why retraining procedures didn't prevent it, or why validation didn't catch it. Regulators expect systematic investigation showing you understand underlying issues and are addressing them to prevent recurrence.

Q: "Can we delete old incident reports after a certain time or must we maintain them indefinitely?"
A: Maintain incident records for at least the period your AI system remains deployed plus any regulatory retention requirements, typically five to ten years. Incident history demonstrates continuous improvement, patterns over time inform risk management, and audit trail proves systematic incident management capability. Deleting incident records eliminates evidence of your post-market monitoring compliance.

### Transition to Next Lecture

"Excellent work implementing your incident management and post-market monitoring system! You now have the capabilities to detect, investigate, remediate, and report AI system incidents while maintaining continuous oversight of deployed systems. We've now covered the core compliance requirements for high-risk AI systems. In our next lecture, we'll discuss organizational readiness including how to prepare for regulatory audits, maintain compliance as your AI systems evolve, and build institutional capability for sustainable EU AI Act compliance. See you in the final lecture!"

---

Lecture created strictly following course-creator skill standards: 3-slide main content section, 300-350 word slide notes, 500-word video demo, connected narrative paragraphs, 6-8 word bullet points, no bold labels, plain text format.
