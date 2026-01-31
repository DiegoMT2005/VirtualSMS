/**
 * REQUIREMENTS COMPLIANCE AUDIT TOOL
 * 
 * This script audits the Voice AI & SMS Booking Platform against
 * the original scope of work requirements.
 */

import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  category: string;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_IMPLEMENTED';
  evidence: string[];
  notes: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface AuditReport {
  timestamp: string;
  overallScore: number;
  totalRequirements: number;
  passed: number;
  failed: number;
  partial: number;
  notImplemented: number;
  results: AuditResult[];
  summary: string;
  criticalIssues: string[];
  recommendations: string[];
}

class RequirementsAuditor {
  private results: AuditResult[] = [];
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  // Helper to check if file exists
  private fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(path.join(this.projectRoot, filePath));
    } catch {
      return false;
    }
  }

  // Helper to read file content
  private readFile(filePath: string): string {
    try {
      return fs.readFileSync(path.join(this.projectRoot, filePath), 'utf-8');
    } catch {
      return '';
    }
  }

  // Helper to search for text in file
  private fileContains(filePath: string, searchText: string | RegExp): boolean {
    const content = this.readFile(filePath);
    if (typeof searchText === 'string') {
      return content.includes(searchText);
    }
    return searchText.test(content);
  }

  // Helper to count occurrences
  private countOccurrences(filePath: string, pattern: RegExp): number {
    const content = this.readFile(filePath);
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
  }

  // Add audit result
  private addResult(result: AuditResult) {
    this.results.push(result);
  }

  // 1. PLATFORM & ARCHITECTURE REQUIREMENTS
  auditPlatformArchitecture() {
    console.log('🔍 Auditing Platform & Architecture...');

    // Check for VAPI/Retell/Voice platform integration
    const vapiExists = this.fileExists('app/api/webhooks/vapi');
    const twilioExists = this.fileExists('app/api/webhooks/twilio');
    
    this.addResult({
      category: 'Platform Architecture',
      requirement: 'Voice & SMS platform integration (VAPI/Retell/Bland)',
      status: vapiExists && twilioExists ? 'PASS' : 'PARTIAL',
      evidence: [
        vapiExists ? '✓ VAPI webhook endpoint exists' : '✗ VAPI webhook missing',
        twilioExists ? '✓ Twilio webhook endpoint exists' : '✗ Twilio webhook missing'
      ],
      notes: vapiExists && twilioExists 
        ? 'Both voice and SMS platforms integrated' 
        : 'Missing platform integration',
      priority: 'CRITICAL'
    });

    // Check for conversation agent
    const agentExists = this.fileExists('lib/ai/conversation-agent.ts');
    this.addResult({
      category: 'Platform Architecture',
      requirement: 'AI Conversation Agent implementation',
      status: agentExists ? 'PASS' : 'FAIL',
      evidence: [agentExists ? '✓ conversation-agent.ts exists' : '✗ No conversation agent found'],
      notes: agentExists ? 'Conversation agent implemented' : 'CRITICAL: No AI agent found',
      priority: 'CRITICAL'
    });
  }

  // 2. CONVERSATIONAL EXCELLENCE
  auditConversationalQuality() {
    console.log('🔍 Auditing Conversational Excellence...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const agentContent = this.readFile(agentFile);

    // Check for system prompt
    const hasSystemPrompt = this.fileContains(agentFile, /system.*prompt/i) || 
                           this.fileContains(agentFile, /SYSTEM_PROMPT/);
    
    // Check for natural language patterns
    const hasNaturalLanguage = agentContent.includes('casual') || 
                               agentContent.includes('friendly') ||
                               agentContent.includes('conversational');

    // Check for robotic phrase prevention
    const preventsRoboticPhrases = agentContent.includes('never') && 
                                   (agentContent.includes('robotic') || 
                                    agentContent.includes('formal'));

    this.addResult({
      category: 'Conversational Excellence',
      requirement: 'Human-like, natural conversation (not robotic)',
      status: hasSystemPrompt && hasNaturalLanguage ? 'PARTIAL' : 'FAIL',
      evidence: [
        hasSystemPrompt ? '✓ System prompt defined' : '✗ No system prompt',
        hasNaturalLanguage ? '✓ Natural language instructions' : '✗ No natural language guidance',
        preventsRoboticPhrases ? '✓ Anti-robotic instructions' : '✗ No robotic phrase prevention'
      ],
      notes: 'Requires manual testing to verify actual conversation quality',
      priority: 'CRITICAL'
    });
  }

  // 3. CONTEXT RETENTION & STATE MANAGEMENT
  auditContextRetention() {
    console.log('🔍 Auditing Context Retention & State Management...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const agentContent = this.readFile(agentFile);

    // Check for conversation history handling
    const hasHistoryHandling = this.fileContains(agentFile, /history|messages|context/i);
    
    // Check for state management
    const hasStateManagement = this.fileContains(agentFile, /state|conversation_state/i);

    // Check for FAQ handling without losing context
    const hasFAQHandling = agentContent.includes('FAQ') || 
                          agentContent.includes('question') ||
                          agentContent.includes('interrupt');

    // Check database schema for state storage
    const schemaFile = 'DATABASE_SCHEMA.md';
    const hasStateStorage = this.fileContains(schemaFile, /conversation_state|state/i);

    this.addResult({
      category: 'Context Retention',
      requirement: 'Perfect memory - handles interruptions without losing progress',
      status: hasHistoryHandling && hasStateManagement && hasStateStorage ? 'PARTIAL' : 'FAIL',
      evidence: [
        hasHistoryHandling ? '✓ Conversation history handling' : '✗ No history handling',
        hasStateManagement ? '✓ State management code' : '✗ No state management',
        hasFAQHandling ? '✓ FAQ/interruption handling' : '✗ No interruption handling',
        hasStateStorage ? '✓ Database state storage' : '✗ No state persistence'
      ],
      notes: 'Requires testing to verify context is maintained across interruptions',
      priority: 'CRITICAL'
    });
  }

  // 4. ZERO HALLUCINATIONS
  auditHallucinationPrevention() {
    console.log('🔍 Auditing Hallucination Prevention...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const agentContent = this.readFile(agentFile);

    // Check for tool/function calling
    const hasToolCalling = this.fileContains(agentFile, /tools|functions|tool_calls/i);
    
    // Check for strict data validation
    const hasValidation = agentContent.includes('validate') || 
                         agentContent.includes('verify') ||
                         agentContent.includes('check');

    // Check for "don't make up" instructions
    const hasAntiHallucination = agentContent.toLowerCase().includes('never make up') ||
                                agentContent.toLowerCase().includes('only use') ||
                                agentContent.toLowerCase().includes('don\'t invent');

    // Check for tool execution limits
    const hasExecutionLimits = agentContent.includes('limit') || 
                              agentContent.includes('maximum') ||
                              agentContent.includes('prevent');

    this.addResult({
      category: 'Hallucination Prevention',
      requirement: 'Zero hallucinations - never makes up information',
      status: hasToolCalling && hasAntiHallucination ? 'PARTIAL' : 'FAIL',
      evidence: [
        hasToolCalling ? '✓ Tool/function calling implemented' : '✗ No tool calling',
        hasValidation ? '✓ Data validation present' : '✗ No validation',
        hasAntiHallucination ? '✓ Anti-hallucination instructions' : '✗ No hallucination prevention',
        hasExecutionLimits ? '✓ Tool execution limits' : '✗ No execution limits'
      ],
      notes: 'Requires extensive testing to verify no hallucinations occur',
      priority: 'CRITICAL'
    });
  }

  // 5. TOOL INTEGRATION
  auditToolIntegration() {
    console.log('🔍 Auditing Tool Integration...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const agentContent = this.readFile(agentFile);

    // Required tools from spec
    const requiredTools = [
      'check_client',
      'check_services',
      'get_availability',
      'update_address',
      'create_booking',
      'create_new_client',
      'update_appointment'
    ];

    const toolsFound: string[] = [];
    const toolsMissing: string[] = [];

    requiredTools.forEach(tool => {
      const toolName = tool.replace(/_/g, '');
      if (agentContent.toLowerCase().includes(tool.toLowerCase()) ||
          agentContent.toLowerCase().includes(toolName.toLowerCase())) {
        toolsFound.push(tool);
      } else {
        toolsMissing.push(tool);
      }
    });

    this.addResult({
      category: 'Tool Integration',
      requirement: 'All 7 required tools integrated and working',
      status: toolsFound.length === requiredTools.length ? 'PASS' : 
              toolsFound.length >= 4 ? 'PARTIAL' : 'FAIL',
      evidence: [
        `✓ ${toolsFound.length}/${requiredTools.length} tools found`,
        ...toolsFound.map(t => `  ✓ ${t}`),
        ...toolsMissing.map(t => `  ✗ ${t} missing`)
      ],
      notes: toolsMissing.length > 0 
        ? `Missing tools: ${toolsMissing.join(', ')}` 
        : 'All required tools present',
      priority: 'CRITICAL'
    });
  }

  // 6. BOOKING FLOW COMPLETENESS
  auditBookingFlow() {
    console.log('🔍 Auditing Complete Booking Flow...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const agentContent = this.readFile(agentFile);

    // Required flow steps
    const flowSteps = [
      { name: 'Greeting', keywords: ['greeting', 'hello', 'welcome'] },
      { name: 'Customer verification', keywords: ['verify', 'check_client', 'existing'] },
      { name: 'Address collection', keywords: ['address', 'location', 'pickup'] },
      { name: 'Address validation', keywords: ['validate', 'google', 'maps'] },
      { name: 'Service selection', keywords: ['service', 'regular', 'express', 'premium'] },
      { name: 'Availability check', keywords: ['availability', 'time', 'slot'] },
      { name: 'Booking confirmation', keywords: ['confirm', 'booking', 'appointment'] },
      { name: 'Payment collection', keywords: ['payment', 'pay', 'link'] }
    ];

    const stepsImplemented: string[] = [];
    const stepsMissing: string[] = [];

    flowSteps.forEach(step => {
      const hasStep = step.keywords.some(keyword => 
        agentContent.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasStep) {
        stepsImplemented.push(step.name);
      } else {
        stepsMissing.push(step.name);
      }
    });

    this.addResult({
      category: 'Booking Flow',
      requirement: 'Complete 9-step booking flow implemented',
      status: stepsImplemented.length >= 7 ? 'PASS' : 
              stepsImplemented.length >= 5 ? 'PARTIAL' : 'FAIL',
      evidence: [
        `${stepsImplemented.length}/${flowSteps.length} flow steps found`,
        ...stepsImplemented.map(s => `  ✓ ${s}`),
        ...stepsMissing.map(s => `  ✗ ${s}`)
      ],
      notes: stepsMissing.length > 0 
        ? `Missing steps: ${stepsMissing.join(', ')}` 
        : 'Complete booking flow present',
      priority: 'HIGH'
    });
  }

  // 7. PROMPT ENGINEERING QUALITY
  auditPromptEngineering() {
    console.log('🔍 Auditing Prompt Engineering...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const promptsDir = 'app/dashboard/prompts';
    
    const agentContent = this.readFile(agentFile);
    const hasPromptsPage = this.fileExists(`${promptsDir}/page.tsx`);

    // Check for structured prompt architecture
    const hasStructuredPrompt = this.fileContains(agentFile, /CRITICAL|RULES|PERSONALITY|STATE|TOOL/i);
    
    // Check for state-based logic (not step-based)
    const hasStateBased = agentContent.includes('state') && 
                         !agentContent.includes('step 1') &&
                         !agentContent.includes('step 2');

    // Check for FAQ circuit breaker
    const hasFAQCircuitBreaker = agentContent.toLowerCase().includes('faq') ||
                                agentContent.toLowerCase().includes('maximum');

    // Check for edge case handling
    const hasEdgeCases = agentContent.includes('timeout') ||
                        agentContent.includes('error') ||
                        agentContent.includes('invalid');

    // Check for maintainability (comments, documentation)
    const commentCount = this.countOccurrences(agentFile, /\/\*\*|\/\//g);
    const isWellDocumented = commentCount > 10;

    this.addResult({
      category: 'Prompt Engineering',
      requirement: 'Professional prompt architecture with clear structure',
      status: hasStructuredPrompt && hasStateBased ? 'PARTIAL' : 'FAIL',
      evidence: [
        hasStructuredPrompt ? '✓ Structured prompt sections' : '✗ No clear prompt structure',
        hasStateBased ? '✓ State-based logic' : '✗ Not state-based',
        hasFAQCircuitBreaker ? '✓ FAQ circuit breaker' : '✗ No FAQ handling',
        hasEdgeCases ? '✓ Edge case handling' : '✗ No edge case handling',
        isWellDocumented ? '✓ Well documented' : '✗ Insufficient documentation',
        hasPromptsPage ? '✓ Prompt management UI' : '✗ No prompt UI'
      ],
      notes: 'Prompt quality requires manual review and testing',
      priority: 'CRITICAL'
    });
  }

  // 8. MAINTAINABILITY & DOCUMENTATION
  auditMaintainability() {
    console.log('🔍 Auditing Maintainability & Documentation...');

    const docs = [
      'README.md',
      'QUICKSTART.md',
      'DEPLOYMENT.md',
      'DATABASE_SCHEMA.md',
      'AI_ARCHITECTURE.md'
    ];

    const docsFound = docs.filter(doc => this.fileExists(doc));
    const docsMissing = docs.filter(doc => !this.fileExists(doc));

    // Check for prompt documentation
    const hasPromptDocs = this.fileContains('README.md', /prompt/i) ||
                         this.fileExists('PROMPT_GUIDE.md');

    // Check for troubleshooting guide
    const hasTroubleshooting = this.fileContains('README.md', /troubleshoot/i) ||
                              this.fileExists('TROUBLESHOOTING.md');

    // Check for testing guide
    const hasTestingGuide = this.fileExists('TESTING.md');

    // Check for clear code structure
    const hasGoodStructure = this.fileExists('lib/ai') &&
                            this.fileExists('app/api/webhooks') &&
                            this.fileExists('components');

    this.addResult({
      category: 'Maintainability',
      requirement: 'Comprehensive documentation for non-technical maintenance',
      status: docsFound.length >= 4 && hasGoodStructure ? 'PASS' : 'PARTIAL',
      evidence: [
        `${docsFound.length}/${docs.length} core docs present`,
        ...docsFound.map(d => `  ✓ ${d}`),
        ...docsMissing.map(d => `  ✗ ${d}`),
        hasPromptDocs ? '✓ Prompt documentation' : '✗ No prompt docs',
        hasTroubleshooting ? '✓ Troubleshooting guide' : '✗ No troubleshooting',
        hasTestingGuide ? '✓ Testing guide' : '✗ No testing guide',
        hasGoodStructure ? '✓ Clear code structure' : '✗ Poor structure'
      ],
      notes: 'Documentation exists but may need enhancement for non-technical users',
      priority: 'HIGH'
    });
  }

  // 9. PAYMENT PROCESSING
  auditPaymentProcessing() {
    console.log('🔍 Auditing Payment Processing...');

    const agentFile = 'lib/ai/conversation-agent.ts';
    const agentContent = this.readFile(agentFile);

    // Check for payment link generation
    const hasPaymentLink = agentContent.includes('payment') && 
                          (agentContent.includes('link') || agentContent.includes('url'));

    // Check for Stripe integration (optional)
    const hasStripe = this.fileContains('package.json', 'stripe');

    // Check for payment status tracking
    const schemaFile = 'DATABASE_SCHEMA.md';
    const hasPaymentTracking = this.fileContains(schemaFile, /payment_status|payment_amount/i);

    this.addResult({
      category: 'Payment Processing',
      requirement: 'SMS payment link generation (voice optional)',
      status: hasPaymentLink || hasPaymentTracking ? 'PARTIAL' : 'NOT_IMPLEMENTED',
      evidence: [
        hasPaymentLink ? '✓ Payment link logic' : '✗ No payment link generation',
        hasStripe ? '✓ Stripe integration' : '○ Stripe not integrated (optional)',
        hasPaymentTracking ? '✓ Payment tracking in DB' : '✗ No payment tracking'
      ],
      notes: 'Payment link generation is required for SMS flow',
      priority: 'HIGH'
    });
  }

  // 10. MONITORING & ANALYTICS
  auditMonitoring() {
    console.log('🔍 Auditing Monitoring & Analytics...');

    const hasAnalyticsPage = this.fileExists('app/dashboard/analytics/page.tsx');
    const hasDashboard = this.fileExists('app/dashboard/page.tsx');
    
    // Check for metrics tracking
    const schemaFile = 'DATABASE_SCHEMA.md';
    const hasMetrics = this.fileContains(schemaFile, /analytics|metrics|stats/i);

    // Check for error logging
    const agentFile = 'lib/ai/conversation-agent.ts';
    const hasErrorLogging = this.fileContains(agentFile, /console\.(log|error)|logger/i);

    this.addResult({
      category: 'Monitoring & Analytics',
      requirement: 'Dashboard with conversation metrics and alerts',
      status: hasAnalyticsPage && hasDashboard ? 'PASS' : 'PARTIAL',
      evidence: [
        hasAnalyticsPage ? '✓ Analytics page exists' : '✗ No analytics page',
        hasDashboard ? '✓ Dashboard exists' : '✗ No dashboard',
        hasMetrics ? '✓ Metrics tracking in DB' : '✗ No metrics tracking',
        hasErrorLogging ? '✓ Error logging' : '✗ No error logging'
      ],
      notes: 'Basic monitoring present, may need enhancement',
      priority: 'MEDIUM'
    });
  }

  // 11. TESTING & VALIDATION
  auditTesting() {
    console.log('🔍 Auditing Testing & Validation...');

    const hasTestingDoc = this.fileExists('TESTING.md');
    const hasTestScript = this.fileExists('lib/ai/test-agent.ts');
    const hasTestEndpoint = this.fileExists('app/api/test-llm/route.ts');

    // Check package.json for test scripts
    const packageJson = this.readFile('package.json');
    const hasTestCommand = packageJson.includes('"test') || packageJson.includes('test:');

    this.addResult({
      category: 'Testing & Validation',
      requirement: '50+ test conversation transcripts and validation',
      status: hasTestScript || hasTestEndpoint ? 'PARTIAL' : 'NOT_IMPLEMENTED',
      evidence: [
        hasTestingDoc ? '✓ Testing documentation' : '✗ No testing docs',
        hasTestScript ? '✓ Test agent script' : '✗ No test script',
        hasTestEndpoint ? '✓ Test API endpoint' : '✗ No test endpoint',
        hasTestCommand ? '✓ Test command in package.json' : '✗ No test command'
      ],
      notes: 'Testing infrastructure exists but needs 50+ conversation tests',
      priority: 'HIGH'
    });
  }

  // 12. SECURITY
  auditSecurity() {
    console.log('🔍 Auditing Security...');

    const hasEnvExample = this.fileExists('.env.example');
    const hasGitignore = this.fileExists('.gitignore');
    
    // Check if .env is in gitignore
    const gitignoreContent = this.readFile('.gitignore');
    const envIgnored = gitignoreContent.includes('.env');

    // Check for Twilio signature verification
    const twilioWebhook = this.readFile('app/api/webhooks/twilio/sms/route.ts');
    const hasSignatureVerification = twilioWebhook.includes('signature') || 
                                    twilioWebhook.includes('validateRequest');

    // Check for input sanitization
    const agentFile = 'lib/ai/conversation-agent.ts';
    const hasSanitization = this.fileContains(agentFile, /sanitize|validate|escape/i);

    this.addResult({
      category: 'Security',
      requirement: 'Secure credential storage and webhook validation',
      status: hasEnvExample && envIgnored && hasSignatureVerification ? 'PASS' : 'PARTIAL',
      evidence: [
        hasEnvExample ? '✓ .env.example provided' : '✗ No .env.example',
        envIgnored ? '✓ .env in .gitignore' : '✗ .env not ignored',
        hasSignatureVerification ? '✓ Webhook signature verification' : '✗ No signature verification',
        hasSanitization ? '✓ Input sanitization' : '✗ No input sanitization'
      ],
      notes: hasSignatureVerification ? 'Good security practices' : 'CRITICAL: Missing webhook security',
      priority: 'CRITICAL'
    });
  }

  // 13. DATABASE SCHEMA
  auditDatabaseSchema() {
    console.log('🔍 Auditing Database Schema...');

    const schemaFile = 'DATABASE_SCHEMA.md';
    const schemaContent = this.readFile(schemaFile);

    // Required tables
    const requiredTables = [
      'customers',
      'appointments',
      'sms_conversations',
      'sms_messages',
      'service_areas',
      'services'
    ];

    const tablesFound: string[] = [];
    const tablesMissing: string[] = [];

    requiredTables.forEach(table => {
      if (schemaContent.toLowerCase().includes(table.toLowerCase())) {
        tablesFound.push(table);
      } else {
        tablesMissing.push(table);
      }
    });

    this.addResult({
      category: 'Database Schema',
      requirement: 'Complete database schema for booking system',
      status: tablesFound.length === requiredTables.length ? 'PASS' : 'PARTIAL',
      evidence: [
        `${tablesFound.length}/${requiredTables.length} required tables`,
        ...tablesFound.map(t => `  ✓ ${t}`),
        ...tablesMissing.map(t => `  ✗ ${t}`)
      ],
      notes: tablesMissing.length > 0 
        ? `Missing tables: ${tablesMissing.join(', ')}` 
        : 'Complete schema present',
      priority: 'HIGH'
    });
  }

  // Run all audits
  async runFullAudit(): Promise<AuditReport> {
    console.log('🚀 Starting Requirements Compliance Audit...\n');

    this.auditPlatformArchitecture();
    this.auditConversationalQuality();
    this.auditContextRetention();
    this.auditHallucinationPrevention();
    this.auditToolIntegration();
    this.auditBookingFlow();
    this.auditPromptEngineering();
    this.auditMaintainability();
    this.auditPaymentProcessing();
    this.auditMonitoring();
    this.auditTesting();
    this.auditSecurity();
    this.auditDatabaseSchema();

    return this.generateReport();
  }

  // Generate final report
  private generateReport(): AuditReport {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const partial = this.results.filter(r => r.status === 'PARTIAL').length;
    const notImplemented = this.results.filter(r => r.status === 'NOT_IMPLEMENTED').length;
    const total = this.results.length;

    // Calculate score (PASS=100, PARTIAL=50, FAIL=0, NOT_IMPLEMENTED=0)
    const score = ((passed * 100 + partial * 50) / (total * 100)) * 100;

    // Identify critical issues
    const criticalIssues = this.results
      .filter(r => r.priority === 'CRITICAL' && (r.status === 'FAIL' || r.status === 'PARTIAL'))
      .map(r => `${r.category}: ${r.requirement}`);

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Generate summary
    const summary = this.generateSummary(score, passed, failed, partial, notImplemented, total);

    return {
      timestamp: new Date().toISOString(),
      overallScore: Math.round(score),
      totalRequirements: total,
      passed,
      failed,
      partial,
      notImplemented,
      results: this.results,
      summary,
      criticalIssues,
      recommendations
    };
  }

  private generateSummary(score: number, passed: number, failed: number, partial: number, notImplemented: number, total: number): string {
    let summary = `\n${'='.repeat(70)}\n`;
    summary += `  REQUIREMENTS COMPLIANCE AUDIT REPORT\n`;
    summary += `${'='.repeat(70)}\n\n`;
    summary += `Overall Compliance Score: ${Math.round(score)}%\n\n`;
    summary += `Results Breakdown:\n`;
    summary += `  ✅ PASS:            ${passed}/${total} (${Math.round(passed/total*100)}%)\n`;
    summary += `  ⚠️  PARTIAL:         ${partial}/${total} (${Math.round(partial/total*100)}%)\n`;
    summary += `  ❌ FAIL:            ${failed}/${total} (${Math.round(failed/total*100)}%)\n`;
    summary += `  ⭕ NOT IMPLEMENTED: ${notImplemented}/${total} (${Math.round(notImplemented/total*100)}%)\n\n`;

    if (score >= 80) {
      summary += `✅ EXCELLENT: The application meets most requirements!\n`;
    } else if (score >= 60) {
      summary += `⚠️  GOOD: The application meets many requirements but needs improvements.\n`;
    } else if (score >= 40) {
      summary += `⚠️  FAIR: Significant gaps exist. Major work needed.\n`;
    } else {
      summary += `❌ POOR: Critical requirements missing. Extensive work required.\n`;
    }

    return summary;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for critical failures
    const criticalFailures = this.results.filter(
      r => r.priority === 'CRITICAL' && (r.status === 'FAIL' || r.status === 'PARTIAL')
    );

    if (criticalFailures.length > 0) {
      recommendations.push('🚨 CRITICAL: Address all critical priority items immediately');
    }

    // Specific recommendations based on results
    const conversationalResult = this.results.find(r => r.category === 'Conversational Excellence');
    if (conversationalResult && conversationalResult.status !== 'PASS') {
      recommendations.push('Enhance system prompts to sound more human and less robotic');
      recommendations.push('Add explicit instructions to prevent AI-sounding phrases');
    }

    const contextResult = this.results.find(r => r.category === 'Context Retention');
    if (contextResult && contextResult.status !== 'PASS') {
      recommendations.push('Implement robust state management to handle interruptions');
      recommendations.push('Add conversation history persistence across sessions');
    }

    const hallucinationResult = this.results.find(r => r.category === 'Hallucination Prevention');
    if (hallucinationResult && hallucinationResult.status !== 'PASS') {
      recommendations.push('Add strict rules: "Never make up information not provided by tools"');
      recommendations.push('Implement tool execution limits to prevent loops');
    }

    const toolResult = this.results.find(r => r.category === 'Tool Integration');
    if (toolResult && toolResult.status !== 'PASS') {
      recommendations.push('Complete integration of all 7 required tools');
      recommendations.push('Add comprehensive error handling for tool failures');
    }

    const testingResult = this.results.find(r => r.category === 'Testing & Validation');
    if (testingResult && testingResult.status !== 'PASS') {
      recommendations.push('Create 50+ test conversation scenarios');
      recommendations.push('Test edge cases: interruptions, errors, invalid inputs');
    }

    const securityResult = this.results.find(r => r.category === 'Security');
    if (securityResult && securityResult.status !== 'PASS') {
      recommendations.push('Implement Twilio webhook signature verification');
      recommendations.push('Add input sanitization and validation');
    }

    return recommendations;
  }

  // Print detailed report
  printDetailedReport(report: AuditReport) {
    console.log(report.summary);

    if (report.criticalIssues.length > 0) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`  🚨 CRITICAL ISSUES (${report.criticalIssues.length})`);
      console.log(`${'='.repeat(70)}\n`);
      report.criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue}`);
      });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`  📋 DETAILED RESULTS`);
    console.log(`${'='.repeat(70)}\n`);

    // Group by category
    const categories = Array.from(new Set(this.results.map(r => r.category)));
    
    categories.forEach(category => {
      console.log(`\n📁 ${category}`);
      console.log(`${'─'.repeat(70)}`);
      
      const categoryResults = this.results.filter(r => r.category === category);
      categoryResults.forEach(result => {
        const statusIcon = {
          'PASS': '✅',
          'PARTIAL': '⚠️',
          'FAIL': '❌',
          'NOT_IMPLEMENTED': '⭕'
        }[result.status];

        console.log(`\n${statusIcon} ${result.status} - ${result.requirement}`);
        console.log(`   Priority: ${result.priority}`);
        if (result.evidence.length > 0) {
          console.log(`   Evidence:`);
          result.evidence.forEach(e => console.log(`     ${e}`));
        }
        if (result.notes) {
          console.log(`   Notes: ${result.notes}`);
        }
      });
    });

    if (report.recommendations.length > 0) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`  💡 RECOMMENDATIONS`);
      console.log(`${'='.repeat(70)}\n`);
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`  📊 SUMMARY`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Overall Compliance: ${report.overallScore}%`);
    console.log(`\nNext Steps:`);
    if (report.overallScore >= 80) {
      console.log(`  1. Address remaining partial implementations`);
      console.log(`  2. Conduct extensive conversation testing`);
      console.log(`  3. Fine-tune prompts based on test results`);
    } else if (report.overallScore >= 60) {
      console.log(`  1. Fix all critical priority issues`);
      console.log(`  2. Complete missing tool integrations`);
      console.log(`  3. Enhance conversation quality`);
    } else {
      console.log(`  1. Review original requirements document`);
      console.log(`  2. Address all critical failures immediately`);
      console.log(`  3. Consider architectural changes if needed`);
    }

    console.log(`\n${'='.repeat(70)}\n`);
  }

  // Save report to file
  saveReport(report: AuditReport, filename: string = 'AUDIT_REPORT.json') {
    fs.writeFileSync(
      path.join(this.projectRoot, filename),
      JSON.stringify(report, null, 2)
    );
    console.log(`\n📄 Report saved to: ${filename}`);
  }
}

// Main execution
async function main() {
  const auditor = new RequirementsAuditor();
  const report = await auditor.runFullAudit();
  auditor.printDetailedReport(report);
  auditor.saveReport(report);
  
  // Also save markdown version
  const mdReport = generateMarkdownReport(report);
  fs.writeFileSync('AUDIT_REPORT.md', mdReport);
  console.log(`📄 Markdown report saved to: AUDIT_REPORT.md\n`);
}

function generateMarkdownReport(report: AuditReport): string {
  let md = `# Requirements Compliance Audit Report\n\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  md += `## Overall Score: ${report.overallScore}%\n\n`;
  
  md += `### Results Summary\n\n`;
  md += `| Status | Count | Percentage |\n`;
  md += `|--------|-------|------------|\n`;
  md += `| ✅ PASS | ${report.passed} | ${Math.round(report.passed/report.totalRequirements*100)}% |\n`;
  md += `| ⚠️ PARTIAL | ${report.partial} | ${Math.round(report.partial/report.totalRequirements*100)}% |\n`;
  md += `| ❌ FAIL | ${report.failed} | ${Math.round(report.failed/report.totalRequirements*100)}% |\n`;
  md += `| ⭕ NOT IMPLEMENTED | ${report.notImplemented} | ${Math.round(report.notImplemented/report.totalRequirements*100)}% |\n\n`;

  if (report.criticalIssues.length > 0) {
    md += `## 🚨 Critical Issues\n\n`;
    report.criticalIssues.forEach((issue, i) => {
      md += `${i + 1}. ${issue}\n`;
    });
    md += `\n`;
  }

  md += `## 📋 Detailed Results\n\n`;
  const categories = Array.from(new Set(report.results.map(r => r.category)));
  
  categories.forEach(category => {
    md += `### ${category}\n\n`;
    const categoryResults = report.results.filter(r => r.category === category);
    
    categoryResults.forEach(result => {
      const statusIcon = {
        'PASS': '✅',
        'PARTIAL': '⚠️',
        'FAIL': '❌',
        'NOT_IMPLEMENTED': '⭕'
      }[result.status];

      md += `#### ${statusIcon} ${result.requirement}\n\n`;
      md += `- **Status:** ${result.status}\n`;
      md += `- **Priority:** ${result.priority}\n`;
      md += `- **Evidence:**\n`;
      result.evidence.forEach(e => md += `  - ${e}\n`);
      if (result.notes) {
        md += `- **Notes:** ${result.notes}\n`;
      }
      md += `\n`;
    });
  });

  if (report.recommendations.length > 0) {
    md += `## 💡 Recommendations\n\n`;
    report.recommendations.forEach((rec, i) => {
      md += `${i + 1}. ${rec}\n`;
    });
    md += `\n`;
  }

  return md;
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { RequirementsAuditor };
export type { AuditReport, AuditResult };
