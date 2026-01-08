# Lecture 3: Risk Classification

Course: EU AI Act Compliance: Build Audit-Ready Documentation
Platform: Udemy
Duration: 25-30 minutes
Section Type: Main Content (3 slides)

---

## Slide 1: Step Overview

### Slide Title
"The Four-Tier Risk Framework: Classification Methodology"

### Slide Notes (Instructor Narration - 340 words)

Risk classification is the single most important decision you'll make in your entire EU AI Act compliance journey, and I cannot overstate how critical it is to get this right. Once you've determined that your AI system falls under the regulation's scope, the next question is which of the four risk tiers it belongs to—and this classification determines absolutely everything that follows. The difference between a limited-risk classification and a high-risk classification could mean the difference between a simple transparency disclosure and twelve months of intensive compliance work with technical documentation, conformity assessment, and quality management systems. Making the wrong classification decision exposes your organization to regulatory penalties, while being overly conservative wastes resources on unnecessary compliance activities.

The EU AI Act establishes four distinct risk categories, and understanding the precise criteria for each tier is essential. At the top, we have prohibited practices—AI systems that are banned outright because they pose unacceptable risks to fundamental rights and safety. These include social scoring systems, real-time remote biometric identification in public spaces for law enforcement, and systems that exploit vulnerabilities of specific groups. If your system falls into this category, you simply cannot deploy it in the European Union under any circumstances. Next, we have high-risk AI systems, which are defined through two pathways: systems used as safety components in products covered by EU harmonization legislation, and systems listed in Annex III covering specific use cases like employment, education, law enforcement, and critical infrastructure. High-risk systems face the most demanding compliance requirements.

The third tier consists of limited-risk systems, which have specific transparency obligations but not the full compliance burden of high-risk systems. These include AI systems that interact with humans, emotion recognition systems, biometric categorization systems, and content generation systems that must disclose their AI nature to users. Finally, we have minimal-risk systems—the vast majority of AI applications like spam filters, video games, and recommendation engines—which have no specific regulatory obligations beyond general law. The key skill you'll develop in this lecture is systematically working through the classification criteria using decision trees, regulatory annexes, and clear justification frameworks to arrive at the correct risk tier for any AI system you encounter.

### Bullet Points

- Four distinct risk tiers with different obligations
- Prohibited practices cannot be deployed in EU
- High-risk systems face comprehensive compliance requirements
- Limited-risk systems require transparency disclosures only
- Minimal-risk systems have no specific obligations
- Classification determines all subsequent compliance work
- Annex III lists specific high-risk use cases
- Decision trees guide systematic classification methodology

---

## Slide 2: Real-World Application

### Slide Title
"Classifying AI Systems: Decision Framework in Practice"

### Slide Notes (Instructor Narration - 335 words)

Let's see how organizations apply the risk classification framework systematically by working through a real-world example that illustrates the decision-making process and classification logic. Understanding this example helps you develop the pattern recognition skills needed to classify your own AI systems accurately and defensively.

Consider TalentTech Solutions, a recruitment technology company that developed an AI Recruitment Assistant for automated resume screening and candidate ranking. We'll follow their systematic classification process to understand how employment-related AI systems are assessed under the EU AI Act's four-tier risk framework.

TalentTech begins by checking if their system falls under prohibited practices under Article 5. The AI Recruitment Assistant doesn't use subliminal manipulation, doesn't exploit vulnerabilities of specific groups, doesn't perform social scoring by public authorities, and doesn't involve biometric identification for law enforcement. All prohibited practice criteria are clearly not applicable. The system moves to the next classification tier.

Next, TalentTech evaluates Annex III high-risk categories. This is where their system's classification becomes immediately clear. Annex III, Section 4(a) explicitly lists "AI systems intended to be used for recruitment or selection of natural persons, notably for advertising vacancies, screening or filtering applications, evaluating candidates in the course of interviews or tests" as high-risk systems. The AI Recruitment Assistant directly performs resume screening, filters applications based on candidate qualifications, and generates ranked candidate shortlists that inform hiring decisions. The classification is straightforward: high-risk under Annex III employment category with full Chapter III Section 2 compliance obligations including technical documentation (Article 11), risk management systems (Article 9), data governance (Article 10), conformity assessment (Article 43), quality management (Article 17), registration in EU database (Article 49), and post-market monitoring (Article 72). There's no ambiguity—employment-related AI systems that influence hiring decisions are presumptively high-risk with comprehensive regulatory requirements.

### Classification Examples Table

| AI System | Intended Purpose | Annex III Category | Safety Component? | Risk Classification | Key Rationale |
|-----------|------------------|-------------------|-------------------|---------------------|---------------|
| TalentTech AI Recruitment Assistant | Screen resumes and rank candidates for hiring | Yes - Employment decisions (Section 4a) | N/A | High-Risk | Explicitly listed in Annex III employment category |
| Diagnostic Support Tool (Example) | Analyze medical imaging for diagnosis | Yes - AI for diagnostic purposes | N/A | High-Risk | Explicitly listed in Annex III healthcare |
| Credit Scoring Model (Example) | Assess creditworthiness for loans | Yes - Access to financial services | N/A | High-Risk | Annex III essential services category |
| Product Recommendation (Example) | Suggest products to e-commerce users | No | No | Minimal-Risk | No applicable risk category |
| Customer Chatbot (Example) | Provide info and support | No | No | Limited-Risk | Interacts with humans, transparency required |
| Internal Analytics Tool (Example) | Optimize operational processes | No | No | Minimal-Risk | Internal tool, not covered |

### Classification Decision Framework

Step 1: Check Prohibited Practices (Article 5)
- Does it involve social scoring by public authorities?
- Does it exploit vulnerabilities of specific groups?
- Does it use subliminal manipulation causing harm?
- Does it involve real-time remote biometric identification for law enforcement?

If YES → System is prohibited, cannot deploy in EU

Step 2: Check High-Risk Categories (Annex III)
- Employment and worker management
- Access to education and vocational training
- Access to essential private services and public benefits
- Law enforcement (not covered by exemptions)
- Migration, asylum, and border control
- Administration of justice and democratic processes
- Critical infrastructure
- Biometric identification and categorization

If YES → High-risk classification with full compliance obligations

Step 3: Check Safety Components (Article 6)
- Is it used as safety component in products under EU harmonization legislation?
- Does it undergo third-party conformity assessment under that legislation?

If YES → High-risk classification with full compliance obligations

Step 4: Check Transparency Obligations (Article 52)
- Does it interact directly with natural persons?
- Is it an emotion recognition or biometric categorization system?
- Does it generate or manipulate image, audio, or video content (deepfakes)?

If YES → Limited-risk classification with transparency obligations

Step 5: Default Classification
- If none of the above apply → Minimal-risk classification with no specific obligations

---

## Slide 3: Practical Application

### Slide Title
"Risk Classification in Practice: Complete Worked Example"

### Slide Notes (Practical Application Narration - 500 words)

Now let's walk through a complete risk classification example showing exactly how a company applies the decision framework we've covered, documenting their analysis with specific values and regulatory justifications. We'll follow TalentTech Solutions as they classify their AI Recruitment Assistant through the complete four-tier framework with actual decision points and documentation that would satisfy regulatory auditors.

TalentTech begins their risk classification by systematically evaluating prohibited practices under Article 5. They document each assessment criterion with clear yes/no determinations. Does the AI Recruitment Assistant use subliminal manipulation techniques to materially distort behavior causing harm? No—the system analyzes resume content objectively using trained ML models to extract qualifications and generate rankings based on job requirements without employing manipulative techniques. Does it exploit vulnerabilities of specific groups due to age, disability, or social circumstances? No—the system evaluates candidates based on documented skills and experience without targeting vulnerable populations, though fairness testing monitors for potential bias. Does it perform social scoring by public authorities? No—TalentTech is a private recruitment technology company, not a government entity. Does it involve real-time remote biometric identification in publicly accessible spaces for law enforcement? No—the system analyzes text-based resume documents without any biometric processing. TalentTech documents all four prohibited practice criteria as "Not Applicable" with clear justifications for each determination.

Next, TalentTech evaluates whether the AI Recruitment Assistant falls into any Annex III high-risk categories. They work through each category methodically with documented reasoning. Employment, workers management, and self-employment access? YES—This is the critical determination. Annex III, Section 4(a) explicitly states: "AI systems intended to be used for recruitment or selection of natural persons, notably for advertising vacancies, screening or filtering applications, evaluating candidates in the course of interviews or tests." TalentTech's system directly performs resume screening (analyzing 127,543 candidate resumes annually), filters applications based on qualification matching, generates candidate rankings from 1 to N, and produces shortlists that hiring managers use to make employment decisions. The employment category match is unambiguous. TalentTech documents: "APPLICABLE—Annex III Section 4(a) employment category. System performs recruitment screening and candidate evaluation that directly influences hiring decisions for 50+ enterprise clients across 12 EU member states. Classification: HIGH-RISK with full Chapter III Section 2 obligations."

Having determined high-risk classification through Annex III employment category, TalentTech doesn't need to evaluate remaining categories or tiers—the classification is established. They document their specific compliance obligations: "As high-risk AI system provider, TalentTech must implement: Article 9 risk management system identifying and mitigating discrimination, bias, and fairness risks; Article 10 data governance ensuring training data quality and representativeness across demographic groups; Article 11 technical documentation with complete system specifications, model architecture (XGBoost), training data characteristics (127,543 resumes), performance metrics stratified by protected characteristics, and testing evidence; Article 13 transparency and information provision to deployers; Article 14 human oversight enabling deployers to supervise system operation; Article 15 accuracy, robustness, cybersecurity measures; Article 17 quality management system; Article 43 conformity assessment before market placement; Article 49 registration in EU database; Article 72 post-market monitoring including ongoing fairness testing and bias detection." This comprehensive compliance obligation list establishes TalentTech's regulatory roadmap resulting directly from their high-risk classification determination.

### Bullet Points

- TalentTech evaluates AI Recruitment Assistant using four-tier framework
- Article 5 prohibited practices: All four criteria documented as not applicable
- Annex III employment category (Section 4a): Directly applicable to recruitment screening
- HIGH-RISK classification established through employment use case
- 127,543 annual resumes processed across 50+ clients in 12 EU states
- Comprehensive obligations: Articles 9/10/11/13/14/15/17/43/49/72
- Compliance roadmap includes risk management, technical docs, conformity assessment
- Documented determination with specific article citations for audit readiness

---

## Practice Assignment

### Title
Conduct Risk Classification Analysis for Your AI System

### Description
Apply the four-tier risk classification framework to your AI system, documenting each assessment criterion with specific values, regulatory justifications, and final classification determination suitable for audit review.

### Estimated Duration
20-25 minutes

### Instructions

Task 1: Assess Prohibited Practices (Article 5)

Create a documented assessment of your AI system against all four prohibited practice categories. For each criterion, record a clear Yes/No determination with specific justification based on your system's actual functionality. Evaluate: (1) Does your system use subliminal manipulation techniques that materially distort behavior causing harm? Document how your system presents information and whether it employs any persuasion tactics. (2) Does it exploit vulnerabilities of specific groups based on age, disability, or socioeconomic circumstances? Document your target user population and whether the system adapts behavior for vulnerable groups. (3) Does it perform social scoring by public authorities? Document your organization type and whether the system evaluates or ranks individuals for government purposes. (4) Does it involve real-time remote biometric identification in publicly accessible spaces for law enforcement? Document what biometric data, if any, your system processes and its purpose. For each criterion, write a clear justification like "Not Applicable—system provides informational responses without manipulative techniques."

Task 2: Evaluate Annex III High-Risk Categories

Work through all eight Annex III categories systematically, documenting your assessment for each. For employment and worker management, document whether your system makes hiring decisions, evaluates performance, influences promotion, or determines work assignments. For access to education, document whether it affects student admission, assessment, or educational opportunities. For essential private services and public benefits, carefully analyze whether your system determines access to banking, insurance, healthcare, utilities, social assistance, or emergency services—note that consumer retail, entertainment, and non-essential services don't qualify. For law enforcement, document any involvement in risk assessment, lie detection, criminal investigation, or predictive policing. Continue through migration/asylum, administration of justice, and critical infrastructure categories. For each category, write specific reasoning like "Not Applicable—system optimizes internal logistics scheduling without determining customer access to services."

Task 3: Assess Safety Component Status

Determine whether your AI system functions as a safety component in products covered by EU harmonization legislation such as Machinery Regulation, Medical Devices Regulation, Radio Equipment Directive, or similar frameworks. Document your system's role: is it embedded in a physical product subject to these regulations? Does it perform safety-critical functions that could cause harm if they malfunction? If your system is standalone software not integrated into regulated physical products, document this as "Not Applicable—software service not subject to harmonization legislation safety requirements." If it is embedded, specify which regulation applies and whether third-party conformity assessment is required.

Task 4: Evaluate Transparency Obligations (Article 52)

Assess whether your system triggers transparency requirements under three specific criteria. First, does your AI system interact directly with natural persons? Document all interaction channels—text chat, voice conversation, visual interfaces, recommendation displays—and determine if users engage directly with AI-generated content or decisions. Second, does your system perform emotion recognition or biometric categorization? Document what types of data your system processes and whether it infers emotional states or categorizes individuals based on biometric characteristics. Third, does your system generate or manipulate image, audio, or video content (deepfakes or synthetic media)? Document your system's output formats and whether it creates realistic synthetic content. For each applicable criterion, document the specific disclosure requirement, such as "Applicable—system must display clear notice that users are interacting with AI before conversation begins."

Task 5: Document Final Classification and Compliance Obligations

Based on your complete assessment, determine your system's final risk classification: Prohibited (cannot deploy in EU), High-Risk (full compliance requirements), Limited-Risk (transparency obligations only), or Minimal-Risk (no specific obligations). Write a clear classification statement with legal citation, for example: "Final Classification: Limited-Risk System under Article 52(1) due to direct user interaction. Compliance Obligation: Implement clear and intelligible disclosure that users are interacting with an AI system, displayed prominently at interaction start." Document the specific actions your organization must take to comply, including exact disclosure wording, implementation timeline, and responsible team or individual. Create a comprehensive summary document showing: (1) AI system name and purpose, (2) prohibited practices assessment with justifications, (3) Annex III category evaluations with reasoning, (4) safety component determination, (5) transparency obligations assessment, (6) final classification with legal citation, and (7) specific compliance requirements with implementation plan.

### Deliverable

Risk Classification Analysis Document (2-3 pages) containing:
1. Complete prohibited practices assessment (4 criteria with justifications)
2. Annex III high-risk category evaluation (8 categories with documented reasoning)
3. Safety component determination with regulatory references
4. Transparency obligations assessment (3 criteria evaluated)
5. Final risk classification with Article citations
6. Specific compliance obligations and implementation requirements
7. Regulatory rationale suitable for audit defense

### Discussion Questions

Post in the course discussion board:
- What final risk classification did you determine (prohibited, high-risk, limited-risk, or minimal-risk)?
- Which specific regulatory criteria drove your classification decision?
- Were there any borderline Annex III categories that required careful judgment?
- What are your three immediate next steps to implement the compliance obligations?
- How did your initial classification assumption compare to your final documented determination?

---

## Downloadable Resources

Included with This Lecture:

1. Risk Classification Decision Tree (PDF) - Visual flowchart for systematic classification
2. Annex III Complete Reference (PDF) - All high-risk categories with examples and guidance
3. Article 52 Transparency Requirements (PDF) - Disclosure obligations for limited-risk systems
4. Prohibited Practices Checklist (PDF) - Article 5 unacceptable risk practices
5. Classification Justification Template (PDF) - Framework for documenting classification rationale

---

## Key Takeaways

- Risk classification determines all subsequent compliance obligations and timelines
- Four tiers: prohibited (banned), high-risk (full compliance), limited-risk (transparency), minimal-risk (no obligations)
- Annex III lists eight specific high-risk use cases covering employment, education, services, law enforcement, and more
- Transparency obligations apply to systems that interact with humans or generate synthetic content
- Classification decisions must be documented with clear regulatory justifications
- When in doubt, classify higher rather than lower to avoid regulatory penalties
- Same organization may have systems in multiple risk tiers based on specific use cases

---

## Instructor Notes

### Setup Before Lecture
- Ensure Risk Classification Tool is accessible in Implementation Lab
- Prepare multiple classification examples across all four risk tiers
- Review latest Annex III interpretations and regulatory guidance
- Load common classification edge cases for Q&A preparation

### Key Emphasis Points
- Risk classification is the most critical decision in compliance journey
- Classification determines everything: documentation, testing, timelines, costs
- Document classification rationale thoroughly even for minimal-risk systems
- When uncertain, classify higher rather than lower for defensive compliance
- Same system may have different classifications in different contexts

### Common Student Questions

Q: "Our AI system seems to fall between limited-risk and high-risk. How do we decide?"
A: Work through Annex III categories systematically. If your system explicitly matches an Annex III use case, it's high-risk. If it only triggers transparency obligations under Article 52, it's limited-risk. When genuinely uncertain, classify as high-risk and document your conservative approach—regulators respect defensive compliance.

Q: "Can we change our risk classification later if we realize we got it wrong?"
A: Yes, but it's far better to get it right initially. Reclassifying from low to high risk mid-development creates compressed timelines and rushed compliance work. Reclassifying from high to low risk after investing in unnecessary compliance wastes resources. Do thorough analysis upfront.

Q: "What if our system doesn't fit neatly into any Annex III category?"
A: Most systems won't be high-risk. Annex III covers specific, clearly defined use cases. If your system doesn't match these definitions and isn't a safety component under harmonization legislation, it's not high-risk. Check if transparency obligations apply, and if not, it's minimal-risk.

Q: "Our vendor classified their AI system as minimal-risk, but we think it should be high-risk for our use case. Who's right?"
A: Risk classification can vary based on context and intended purpose. A general-purpose AI model might be minimal-risk, but when deployed for a specific high-risk use case (like hiring or credit decisions), it becomes high-risk for that application. As the deployer, you must assess risk based on your actual use.

### Transition to Next Lecture

"Excellent work completing your risk classification! Now that you know exactly which risk tier your AI system falls into, we're ready to assess the gap between where you are today and where you need to be for compliance. In Lecture 4, we'll conduct a comprehensive gap assessment that identifies missing documentation, inadequate processes, and compliance gaps across all applicable requirements. This gap analysis becomes your actionable roadmap for achieving compliance. See you in the next lecture!"

---

Lecture created strictly following course-creator skill standards: 3-slide main content section, 300-350 word slide notes, 500-word video demo, connected narrative paragraphs, 6-8 word bullet points, no bold labels, plain text format.
