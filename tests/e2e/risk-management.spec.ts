import { test, expect } from '@playwright/test';
import { wait, timeout, logSpeedConfig } from '../helpers/demo-config';
import { enableCursorTracking, smoothClick } from '../helpers/cursor-tracker';
import { login } from '../helpers/auth';
import { sampleHRSystem } from '../helpers/seed-data';
import { cleanupTestData, disconnectDatabase, seedAdminDemoUser } from '../helpers/database';

/**
 * E2E Test: Risk Management Workflow
 *
 * Tests the complete risk management workflow including:
 * - Creating a risk register with multiple risks
 * - Adding new risks to an existing register
 * - Editing risk details
 * - Adding mitigation actions
 * - Setting treatment decisions with residual risk
 * - Updating mitigation action status
 * - Deleting risks and mitigations
 *
 * Run with:
 * - DEMO_SPEED=fast npx playwright test tests/e2e/risk-management.spec.ts (development)
 * - DEMO_SPEED=slow npx playwright test tests/e2e/risk-management.spec.ts --headed (demo recording)
 */

test.describe('Risk Management - Complete Workflow', () => {
  test.setTimeout(timeout(300000)); // 5 minutes timeout

  test.beforeAll(async () => {
    console.log('👤 Ensuring admin demo user exists in database...');
    await seedAdminDemoUser();
  });

  // Clean up test data before each test for clean demo videos
  test.beforeEach(async () => {
    console.log('🧹 Cleaning up test data...');
    await cleanupTestData();
  });

  // Disconnect from database after all tests
  test.afterAll(async () => {
    await disconnectDatabase();
  });

  test('should complete full risk management workflow', async ({ page }) => {
    logSpeedConfig();

    // Enable cursor tracking for professional appearance
    await enableCursorTracking(page);

    console.log('\n🎬 Starting Risk Management Workflow Test\n');

    // Step 1: Login
    console.log('📝 Step 1: Login to the application');
    await page.goto('/');
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.waitForTimeout(wait(5000));
    await login(page);
    await page.waitForTimeout(wait(1000));

    // Step 2: Create an AI System first (prerequisite for risk register)
    console.log('📝 Step 2: Create AI System for risk assessment');
    await page.goto('/dashboard/systems/new');
    await page.waitForTimeout(wait(2000));

    // Fill system details
    const nameInput = page.getByTestId('system-name-input');
    await smoothClick(page, nameInput);
    await page.waitForTimeout(wait(500));
    await nameInput.fill(sampleHRSystem.name);
    await page.waitForTimeout(wait(1000));

    const purposeTextarea = page.getByTestId('system-business-purpose-textarea');
    await smoothClick(page, purposeTextarea);
    await page.waitForTimeout(wait(500));
    await purposeTextarea.fill(sampleHRSystem.businessPurpose);
    await page.waitForTimeout(wait(1000));

    // Select primary users
    for (const userType of sampleHRSystem.primaryUsers) {
      const checkbox = page.getByTestId(`system-user-checkbox-${userType}`);
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(300));
    }

    // Select data categories
    for (const dataCategory of sampleHRSystem.dataCategories) {
      const checkbox = page.getByTestId(`system-data-checkbox-${dataCategory}`);
      await smoothClick(page, checkbox);
      await page.waitForTimeout(wait(300));
    }

    // Select deployment status
    const statusSelect = page.getByTestId('system-deployment-status-select');
    await smoothClick(page, statusSelect);
    await page.waitForTimeout(wait(500));
    const statusOption = page.getByTestId(`system-deployment-status-option-${sampleHRSystem.deploymentStatus}`);
    await smoothClick(page, statusOption);
    await page.waitForTimeout(wait(1000));

    // Submit system creation
    const submitButton = page.getByTestId('system-submit-button');
    await smoothClick(page, submitButton);
    await page.waitForTimeout(wait(2000));

    // Verify redirect to systems list
    await expect(page).toHaveURL(/\/dashboard\/systems/);
    await page.waitForTimeout(wait(1000));

    // Step 3: Navigate to Risk Management
    console.log('📝 Step 3: Navigate to Risk Management');
    await page.goto('/dashboard/risk-management');
    await page.waitForTimeout(wait(2000));

    // Verify risk management page is displayed
    await expect(page.getByTestId('risk-management-page-title')).toBeVisible();
    await page.waitForTimeout(wait(1000));

    // Step 4: Create New Risk Register
    console.log('📝 Step 4: Create new risk register with wizard');
    const createButton = page.getByTestId('risk-management-create-button');
    await smoothClick(page, createButton);
    await page.waitForTimeout(wait(2000));

    // Verify wizard is displayed
    await expect(page.getByTestId('risk-register-wizard-title')).toBeVisible();
    await page.waitForTimeout(wait(1000));

    // Select AI System
    const systemSelect = page.getByTestId('wizard-system-select');
    await smoothClick(page, systemSelect);
    await page.waitForTimeout(wait(500));

    // Select the first system (our newly created HR system)
    const systemOption = page.locator('[role="option"]').first();
    await smoothClick(page, systemOption);
    await page.waitForTimeout(wait(1000));

    // Step 5: Add First Risk - Algorithmic Bias
    console.log('📝 Step 5: Add first risk - Algorithmic Bias');

    // Fill risk title
    const risk1TitleInput = page.getByTestId('risk-0-title-input');
    await smoothClick(page, risk1TitleInput);
    await page.waitForTimeout(wait(500));
    await risk1TitleInput.fill('Algorithmic Bias in Resume Screening');
    await page.waitForTimeout(wait(1000));

    // Select risk type - BIAS
    const risk1TypeSelect = page.getByTestId('risk-0-type-select');
    await smoothClick(page, risk1TypeSelect);
    await page.waitForTimeout(wait(500));
    const biasOption = page.getByTestId('risk-0-type-option-BIAS');
    await smoothClick(page, biasOption);
    await page.waitForTimeout(wait(1000));

    // Fill risk description
    const risk1DescTextarea = page.getByTestId('risk-0-description-textarea');
    await smoothClick(page, risk1DescTextarea);
    await page.waitForTimeout(wait(500));
    await risk1DescTextarea.fill('The AI system may exhibit discriminatory bias against protected characteristics such as gender, age, or ethnicity in candidate screening due to historical bias in training data.');
    await page.waitForTimeout(wait(1500));

    // Fill affected stakeholders
    const risk1StakeholdersInput = page.getByTestId('risk-0-stakeholders-input');
    await smoothClick(page, risk1StakeholdersInput);
    await page.waitForTimeout(wait(500));
    await risk1StakeholdersInput.fill('Job applicants, HR team, Hiring managers');
    await page.waitForTimeout(wait(1000));

    // Fill potential impact
    const risk1ImpactTextarea = page.getByTestId('risk-0-potential-impact-textarea');
    await smoothClick(page, risk1ImpactTextarea);
    await page.waitForTimeout(wait(500));
    await risk1ImpactTextarea.fill('Unfair discrimination leading to legal liability, reputational damage, and loss of diverse talent. Potential violation of equal employment opportunity laws.');
    await page.waitForTimeout(wait(1500));

    // Set likelihood to 4 (High)
    const risk1LikelihoodSlider = page.getByTestId('risk-0-likelihood-slider');
    await smoothClick(page, risk1LikelihoodSlider);
    await page.waitForTimeout(wait(500));
    await risk1LikelihoodSlider.fill('4');
    await page.waitForTimeout(wait(1000));

    // Set impact to 5 (Very High)
    const risk1ImpactSlider = page.getByTestId('risk-0-impact-slider');
    await smoothClick(page, risk1ImpactSlider);
    await page.waitForTimeout(wait(500));
    await risk1ImpactSlider.fill('5');
    await page.waitForTimeout(wait(1000));

    // Verify risk level badge shows HIGH (4*5=20)
    const risk1LevelBadge = page.getByTestId('risk-0-level-badge');
    await expect(risk1LevelBadge).toHaveText('HIGH');
    await page.waitForTimeout(wait(1000));

    // Step 6: Add Second Risk
    console.log('📝 Step 6: Add second risk - Data Privacy');
    const addRiskButton = page.getByTestId('wizard-add-risk-button');
    await smoothClick(page, addRiskButton);
    await page.waitForTimeout(wait(1500));

    // Fill second risk
    const risk2TitleInput = page.getByTestId('risk-1-title-input');
    await smoothClick(page, risk2TitleInput);
    await page.waitForTimeout(wait(500));
    await risk2TitleInput.fill('Unauthorized Access to Candidate Data');
    await page.waitForTimeout(wait(1000));

    // Select risk type - PRIVACY
    const risk2TypeSelect = page.getByTestId('risk-1-type-select');
    await smoothClick(page, risk2TypeSelect);
    await page.waitForTimeout(wait(500));
    const privacyOption = page.getByTestId('risk-1-type-option-PRIVACY');
    await smoothClick(page, privacyOption);
    await page.waitForTimeout(wait(1000));

    const risk2DescTextarea = page.getByTestId('risk-1-description-textarea');
    await smoothClick(page, risk2DescTextarea);
    await page.waitForTimeout(wait(500));
    await risk2DescTextarea.fill('Insufficient access controls could allow unauthorized personnel to view sensitive candidate personal data stored in the AI system.');
    await page.waitForTimeout(wait(1500));

    const risk2StakeholdersInput = page.getByTestId('risk-1-stakeholders-input');
    await smoothClick(page, risk2StakeholdersInput);
    await page.waitForTimeout(wait(500));
    await risk2StakeholdersInput.fill('Job applicants, Data privacy team');
    await page.waitForTimeout(wait(1000));

    const risk2ImpactTextarea = page.getByTestId('risk-1-potential-impact-textarea');
    await smoothClick(page, risk2ImpactTextarea);
    await page.waitForTimeout(wait(500));
    await risk2ImpactTextarea.fill('GDPR violations, regulatory fines, loss of candidate trust, and reputational harm.');
    await page.waitForTimeout(wait(1500));

    // Set likelihood to 3 (Medium)
    const risk2LikelihoodSlider = page.getByTestId('risk-1-likelihood-slider');
    await smoothClick(page, risk2LikelihoodSlider);
    await page.waitForTimeout(wait(500));
    await risk2LikelihoodSlider.fill('3');
    await page.waitForTimeout(wait(1000));

    // Set impact to 4 (High)
    const risk2ImpactSlider = page.getByTestId('risk-1-impact-slider');
    await smoothClick(page, risk2ImpactSlider);
    await page.waitForTimeout(wait(500));
    await risk2ImpactSlider.fill('4');
    await page.waitForTimeout(wait(1000));

    // Verify risk level badge shows MEDIUM (3*4=12)
    const risk2LevelBadge = page.getByTestId('risk-1-level-badge');
    await expect(risk2LevelBadge).toHaveText('MEDIUM');
    await page.waitForTimeout(wait(1000));

    // Step 7: Submit Risk Register
    console.log('📝 Step 7: Submit risk register');
    const wizardSubmitButton = page.getByTestId('wizard-submit-button');
    await smoothClick(page, wizardSubmitButton);
    await page.waitForTimeout(wait(2000));

    // Verify success and redirect to detail page
    await expect(page).toHaveURL(/\/dashboard\/risk-management\/.+/);
    await page.waitForTimeout(wait(2000));

    // Step 8: Verify Risk Register Details
    console.log('📝 Step 8: Verify risk register details page');
    await expect(page.getByTestId('risk-register-detail-title')).toBeVisible();

    // Verify statistics
    const statsTotal = page.getByTestId('risk-stats-total');
    await expect(statsTotal).toContainText('2');

    const statsHigh = page.getByTestId('risk-stats-high');
    await expect(statsHigh).toContainText('1');

    const statsMedium = page.getByTestId('risk-stats-medium');
    await expect(statsMedium).toContainText('1');
    await page.waitForTimeout(wait(2000));

    // Verify both risks are displayed
    await expect(page.getByTestId('risk-card-0')).toBeVisible();
    await expect(page.getByTestId('risk-card-1')).toBeVisible();
    await page.waitForTimeout(wait(1000));

    // Step 9: Add Mitigation Action to First Risk
    console.log('📝 Step 9: Add mitigation action to first risk');
    const addMitigationButton = page.getByTestId('risk-0-add-mitigation-button');
    await smoothClick(page, addMitigationButton);
    await page.waitForTimeout(wait(2000));

    // Fill mitigation dialog
    const mitigationDescTextarea = page.getByTestId('mitigation-description-textarea');
    await smoothClick(page, mitigationDescTextarea);
    await page.waitForTimeout(wait(500));
    await mitigationDescTextarea.fill('Conduct comprehensive bias audit of training data. Implement fairness metrics monitoring (demographic parity, equalized odds). Regular model retraining with balanced datasets.');
    await page.waitForTimeout(wait(1500));

    const mitigationResponsibleInput = page.getByTestId('mitigation-responsible-input');
    await smoothClick(page, mitigationResponsibleInput);
    await page.waitForTimeout(wait(500));
    await mitigationResponsibleInput.fill('Data Science Team');
    await page.waitForTimeout(wait(1000));

    // Set due date (30 days from now)
    const mitigationDueDateInput = page.getByTestId('mitigation-due-date-input');
    await smoothClick(page, mitigationDueDateInput);
    await page.waitForTimeout(wait(500));
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dueDateString = futureDate.toISOString().split('T')[0];
    await mitigationDueDateInput.fill(dueDateString);
    await page.waitForTimeout(wait(1000));

    // Set status to IN_PROGRESS
    const mitigationStatusSelect = page.getByTestId('mitigation-status-select');
    await smoothClick(page, mitigationStatusSelect);
    await page.waitForTimeout(wait(500));
    const inProgressOption = page.getByTestId('mitigation-status-option-IN_PROGRESS');
    await smoothClick(page, inProgressOption);
    await page.waitForTimeout(wait(1000));

    // Submit mitigation
    const saveMitigationButton = page.getByTestId('mitigation-save-button');
    await smoothClick(page, saveMitigationButton);
    await page.waitForTimeout(wait(2000));

    // Verify mitigation is displayed
    await expect(page.getByTestId('risk-0-mitigation-0')).toBeVisible();
    await page.waitForTimeout(wait(1000));

    // Step 10: Set Treatment Decision for First Risk
    console.log('📝 Step 10: Set treatment decision with residual risk');
    const treatmentButton = page.getByTestId('risk-0-treatment-button');
    await smoothClick(page, treatmentButton);
    await page.waitForTimeout(wait(2000));

    // Select MITIGATE decision
    const treatmentDecisionSelect = page.getByTestId('treatment-decision-select');
    await smoothClick(page, treatmentDecisionSelect);
    await page.waitForTimeout(wait(500));
    const mitigateOption = page.getByTestId('treatment-decision-option-MITIGATE');
    await smoothClick(page, mitigateOption);
    await page.waitForTimeout(wait(1000));

    // Fill justification
    const treatmentJustificationTextarea = page.getByTestId('treatment-justification-textarea');
    await smoothClick(page, treatmentJustificationTextarea);
    await page.waitForTimeout(wait(500));
    await treatmentJustificationTextarea.fill('Mitigating this risk through comprehensive bias testing and monitoring is the most effective approach. Complete avoidance would eliminate the benefits of AI-assisted recruitment. The mitigation actions will reduce likelihood to acceptable levels while maintaining system functionality.');
    await page.waitForTimeout(wait(1500));

    // Set residual likelihood to 2 (Low)
    const residualLikelihoodSlider = page.getByTestId('treatment-residual-likelihood-slider');
    await smoothClick(page, residualLikelihoodSlider);
    await page.waitForTimeout(wait(500));
    await residualLikelihoodSlider.fill('2');
    await page.waitForTimeout(wait(1000));

    // Set residual impact to 3 (Medium)
    const residualImpactSlider = page.getByTestId('treatment-residual-impact-slider');
    await smoothClick(page, residualImpactSlider);
    await page.waitForTimeout(wait(500));
    await residualImpactSlider.fill('3');
    await page.waitForTimeout(wait(1000));

    // Verify residual risk score calculation (2*3=6, LOW)
    const residualScoreDisplay = page.getByTestId('treatment-residual-score');
    await expect(residualScoreDisplay).toContainText('6');
    await page.waitForTimeout(wait(1000));

    // Save treatment decision
    const saveTreatmentButton = page.getByTestId('treatment-save-button');
    await smoothClick(page, saveTreatmentButton);
    await page.waitForTimeout(wait(2000));

    // Verify treatment decision is displayed
    await expect(page.getByTestId('risk-0-treatment-badge')).toHaveText('MITIGATE');
    await page.waitForTimeout(wait(1000));

    // Step 11: Add Another Risk from Detail Page
    console.log('📝 Step 11: Add new risk from detail page');
    const addRiskFromDetailButton = page.getByTestId('risk-register-add-risk-button');
    await smoothClick(page, addRiskFromDetailButton);
    await page.waitForTimeout(wait(2000));

    // Fill new risk - Model Degradation
    const newRiskTitleInput = page.getByTestId('add-risk-title-input');
    await smoothClick(page, newRiskTitleInput);
    await page.waitForTimeout(wait(500));
    await newRiskTitleInput.fill('Model Performance Degradation Over Time');
    await page.waitForTimeout(wait(1000));

    const newRiskTypeSelect = page.getByTestId('add-risk-type-select');
    await smoothClick(page, newRiskTypeSelect);
    await page.waitForTimeout(wait(500));
    const safetyOption = page.getByTestId('add-risk-type-option-SAFETY');
    await smoothClick(page, safetyOption);
    await page.waitForTimeout(wait(1000));

    const newRiskDescTextarea = page.getByTestId('add-risk-description-textarea');
    await smoothClick(page, newRiskDescTextarea);
    await page.waitForTimeout(wait(500));
    await newRiskDescTextarea.fill('Model accuracy may degrade as hiring patterns and job requirements evolve, leading to poor candidate recommendations.');
    await page.waitForTimeout(wait(1500));

    const newRiskStakeholdersInput = page.getByTestId('add-risk-stakeholders-input');
    await smoothClick(page, newRiskStakeholdersInput);
    await page.waitForTimeout(wait(500));
    await newRiskStakeholdersInput.fill('Hiring managers, HR department');
    await page.waitForTimeout(wait(1000));

    const newRiskImpactTextarea = page.getByTestId('add-risk-potential-impact-textarea');
    await smoothClick(page, newRiskImpactTextarea);
    await page.waitForTimeout(wait(500));
    await newRiskImpactTextarea.fill('Poor hiring decisions, wasted time reviewing unsuitable candidates, reduced trust in the AI system.');
    await page.waitForTimeout(wait(1500));

    // Set likelihood to 3, impact to 3 (MEDIUM: 3*3=9)
    const newRiskLikelihoodSlider = page.getByTestId('add-risk-likelihood-slider');
    await smoothClick(page, newRiskLikelihoodSlider);
    await page.waitForTimeout(wait(500));
    await newRiskLikelihoodSlider.fill('3');
    await page.waitForTimeout(wait(1000));

    const newRiskImpactSlider = page.getByTestId('add-risk-impact-slider');
    await smoothClick(page, newRiskImpactSlider);
    await page.waitForTimeout(wait(500));
    await newRiskImpactSlider.fill('3');
    await page.waitForTimeout(wait(1000));

    // Save new risk
    const saveNewRiskButton = page.getByTestId('add-risk-save-button');
    await smoothClick(page, saveNewRiskButton);
    await page.waitForTimeout(wait(2000));

    // Verify new risk is added
    await expect(page.getByTestId('risk-card-2')).toBeVisible();
    await page.waitForTimeout(wait(1000));

    // Verify updated statistics
    const updatedStatsTotal = page.getByTestId('risk-stats-total');
    await expect(updatedStatsTotal).toContainText('3');
    await page.waitForTimeout(wait(1000));

    // Step 12: Update Mitigation Status
    console.log('📝 Step 12: Update mitigation action status to COMPLETED');
    const mitigationStatusButton = page.getByTestId('risk-0-mitigation-0-status-button');
    await smoothClick(page, mitigationStatusButton);
    await page.waitForTimeout(wait(1000));
    const completedStatusOption = page.getByTestId('mitigation-status-update-COMPLETED');
    await smoothClick(page, completedStatusOption);
    await page.waitForTimeout(wait(2000));

    // Verify status update
    await expect(page.getByTestId('risk-0-mitigation-0-status-badge')).toHaveText('COMPLETED');
    await page.waitForTimeout(wait(1000));

    // Step 13: Edit Risk Details
    console.log('📝 Step 13: Edit risk details');
    const editRiskButton = page.getByTestId('risk-1-edit-button');
    await smoothClick(page, editRiskButton);
    await page.waitForTimeout(wait(2000));

    // Update description
    const editDescTextarea = page.getByTestId('edit-risk-description-textarea');
    await smoothClick(page, editDescTextarea);
    await page.waitForTimeout(wait(500));
    await editDescTextarea.clear();
    await page.waitForTimeout(wait(300));
    await editDescTextarea.fill('UPDATED: Insufficient access controls and lack of encryption could allow unauthorized personnel to view sensitive candidate personal data stored in the AI system database.');
    await page.waitForTimeout(wait(1500));

    // Increase impact to 5
    const editImpactSlider = page.getByTestId('edit-risk-impact-slider');
    await smoothClick(page, editImpactSlider);
    await page.waitForTimeout(wait(500));
    await editImpactSlider.fill('5');
    await page.waitForTimeout(wait(1000));

    // Save changes
    const saveEditButton = page.getByTestId('edit-risk-save-button');
    await smoothClick(page, saveEditButton);
    await page.waitForTimeout(wait(2000));

    // Verify risk level changed from MEDIUM to HIGH (3*5=15)
    const updatedRisk1LevelBadge = page.getByTestId('risk-1-level-badge');
    await expect(updatedRisk1LevelBadge).toHaveText('HIGH');
    await page.waitForTimeout(wait(1000));

    // Step 14: Navigate Back to Risk Management List
    console.log('📝 Step 14: Navigate back to risk management list');
    await page.goto('/dashboard/risk-management');
    await page.waitForTimeout(wait(2000));

    // Verify risk register is in the list
    await expect(page.getByTestId('risk-register-card-0')).toBeVisible();
    await page.waitForTimeout(wait(1000));

    // Verify statistics on list page
    const listCardTotal = page.getByTestId('risk-register-0-stat-total');
    await expect(listCardTotal).toContainText('3');

    const listCardHigh = page.getByTestId('risk-register-0-stat-high');
    await expect(listCardHigh).toContainText('2'); // First risk + updated second risk
    await page.waitForTimeout(wait(2000));

    console.log('✅ Risk Management Workflow Test Completed Successfully!\n');
  });
});
