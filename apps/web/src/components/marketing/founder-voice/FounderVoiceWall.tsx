import Link from "next/link";
import { ReactNode } from "react";
import { Hdr, OverlayCard, Phone, ScreenWrap } from "./primitives";
import { FounderVoiceLogo } from "@/components/brand/FounderVoiceLogo";

function RowLabel({ children }: { children: ReactNode }) {
  return <div className="fv-row-label">{children}</div>;
}

function Waveform({ heights }: { heights: number[] }) {
  return (
    <div className="fv-waveform">
      {heights.map((h, i) => (
        <span key={i} style={{ height: h }} />
      ))}
    </div>
  );
}

export function FounderVoiceWall() {
  return (
    <div className="fv-wall">
      <h1 className="fv-page-title">FounderVoice — Paper Prototypes</h1>
      <p className="fv-subtitle">Rule your pitch! · Mapped to FounderVoice User Stories 1–10</p>

      <div className="fv-cta-bar">
        <Link href="/signup?role=founder" className="btn-primary">
          Start as founder
        </Link>
        <Link href="/signup?role=investor" className="btn-secondary">
          I&apos;m an investor
        </Link>
        <Link href="/app" className="btn-secondary">
          Open app
        </Link>
      </div>

      {/* ROW 1: Onboarding + Home */}
      <RowLabel>
        Onboarding &amp; Home <span>— US1 entry point</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Splash / Logo">
          <Phone>
            <div className="fv-logo-box" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "16px 0" }}>
              <FounderVoiceLogo variant="mark" size={52} />
              <div className="fv-logo-text" style={{ marginTop: 10, fontSize: 13, fontWeight: "bold" }}>FounderVoice</div>
              <div className="fv-tagline" style={{ fontSize: 8, opacity: 0.7 }}>Rule your pitch!</div>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Login">
          <Phone>
            <div className="fv-logo-box" style={{ paddingTop: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <FounderVoiceLogo variant="mark" size={30} />
              <div className="fv-logo-text" style={{ fontSize: 11, marginTop: 4 }}>
                FounderVoice
              </div>
            </div>
            <div style={{ fontSize: 7, margin: "8px 0 2px" }}>Email</div>
            <div className="fv-input-box" />
            <div style={{ fontSize: 7, margin: "4px 0 2px" }}>Password</div>
            <div className="fv-input-box" />
            <div className="fv-btn fv-btn-fill" style={{ marginTop: 10 }}>
              Log In
            </div>
            <div style={{ textAlign: "center", fontSize: 7, marginTop: 6, opacity: 0.6 }}>
              Sign up as Founder / Investor
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Project List (Home)">
          <Phone>
            <Hdr left="☰" title="My Projects" right="+ NEW" />
            <div className="fv-segment">
              <div className="active">FOUNDER</div>
              <div>INVESTOR</div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>Acme AI</strong>
                <div className="fv-meta">Readiness 72% · 3 gaps · Draft deck</div>
              </div>
              <span>›</span>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>GreenRoute</strong>
                <div className="fv-meta">Readiness 45% · Voice captured</div>
              </div>
              <span>›</span>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>HealthBridge</strong>
                <div className="fv-meta">Investor-ready ✓</div>
              </div>
              <span>›</span>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="New Project">
          <Phone>
            <Hdr left="‹" title="New Project" right="SAVE" />
            <div className="fv-field-row">
              <span>Startup Name</span>
              <span>›</span>
            </div>
            <div className="fv-input-box" style={{ margin: "2px 0 8px" }} />
            <div className="fv-field-row">
              <span>Founder Name</span>
              <span>›</span>
            </div>
            <div className="fv-input-box" style={{ margin: "2px 0 8px" }} />
            <div className="fv-list-item" style={{ border: "none" }}>
              <div className="fv-checkbox checked" />
              <span>Strict mode (watermark until confirmed)</span>
            </div>
          </Phone>
        </ScreenWrap>
      </div>

      {/* ROW 2: US1 */}
      <RowLabel>
        User Story 1 — Founder Voice Capture <span>#VoiceInput #AudioUpload #SpeechToText</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Record / Upload">
          <Phone>
            <Hdr left="‹" title="Voice Capture" right="" />
            <div style={{ textAlign: "center", fontSize: 8, margin: "6px 0" }}>
              Explain your business idea naturally
            </div>
            <div className="fv-mic-circle">🎙</div>
            <div style={{ textAlign: "center", fontSize: 8, fontWeight: "bold" }}>TAP TO RECORD</div>
            <Waveform heights={[8, 14, 20, 12, 18, 10, 16, 8]} />
            <div className="fv-btn fv-btn-outline">⬆ UPLOAD AUDIO FILE</div>
            <div className="fv-btn fv-btn-outline">📋 PASTE TRANSCRIPT</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Active Recording">
          <Phone>
            <Hdr left="‹" title="Recording…" right={<span style={{ color: "red" }}>● REC</span>} />
            <div style={{ textAlign: "center", margin: "20px 0", fontSize: 10 }}>00:02:34</div>
            <Waveform heights={[20, 35, 28, 40, 22, 38, 30, 45, 25]} />
            <div style={{ textAlign: "center", fontSize: 7, margin: "8px 0", opacity: 0.7 }}>
              Live captions appearing below…
            </div>
            <div className="fv-textarea" style={{ height: 50, fontSize: "6.5px", padding: 3 }}>
              We&apos;re building an AI tool that helps small clinics…
            </div>
            <div className="fv-btn fv-btn-fill">STOP &amp; PROCESS</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Processing Audio">
          <Phone>
            <Hdr left="‹" title="Processing" right="" />
            <div style={{ textAlign: "center", margin: "30px 0 10px", fontSize: 20 }}>⏳</div>
            <div style={{ textAlign: "center", fontSize: 8 }}>Transcribing audio…</div>
            <div className="fv-progress-bar">
              <div className="fill" />
            </div>
            <div style={{ fontSize: 7, textAlign: "center", opacity: 0.6 }}>
              Detect language → Transcribe → Extract claims
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Transcript Result">
          <Phone tall>
            <Hdr left="‹" title="Transcript" right="NEXT ›" />
            <div style={{ fontSize: 7, marginBottom: 4, opacity: 0.6 }}>Readable transcript · 3 min</div>
            <div className="fv-textarea" style={{ height: 180, fontSize: "6.5px", padding: 4, lineHeight: 1.4 }}>
              So our startup Acme AI helps small clinics automate patient intake. The problem is clinics
              waste 2 hours daily on paperwork. Our solution uses voice AI to capture patient info at the
              front desk. We have 12 pilot clinics and $8K MRR…
            </div>
            <div className="fv-btn fv-btn-outline" style={{ fontSize: 7 }}>
              ✎ Edit Transcript
            </div>
          </Phone>
        </ScreenWrap>
      </div>

      {/* ROW 3: US2 */}
      <RowLabel>
        User Story 2 — Organize Business Information{" "}
        <span>#BusinessStructure #InformationOrganization</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Structured Sections">
          <Phone tall>
            <Hdr left="‹" title="Business Profile" right="EDIT" />
            <div style={{ fontSize: 7, marginBottom: 6, opacity: 0.6 }}>Organized from your voice input</div>
            <div className="fv-section-card">
              <strong>Problem</strong>
              <div style={{ marginTop: 2 }}>Clinics waste 2hrs/day on paperwork</div>
            </div>
            <div className="fv-section-card">
              <strong>Solution</strong>
              <div style={{ marginTop: 2 }}>Voice AI for patient intake automation</div>
            </div>
            <div className="fv-section-card">
              <strong>Market</strong>
              <div style={{ marginTop: 2 }}>Small clinics in US · $4.2B TAM</div>
            </div>
            <div className="fv-section-card">
              <strong>Traction</strong>
              <div style={{ marginTop: 2 }}>12 pilots · $8K MRR</div>
            </div>
            <div className="fv-section-card missing">
              <strong>Business Model</strong> <span className="fv-badge missing">MISSING</span>
              <div style={{ marginTop: 2 }}>— not identified —</div>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Section Detail">
          <Phone>
            <Hdr left="‹" title="Problem" right="" />
            <div style={{ fontSize: 7, opacity: 0.6, marginBottom: 6 }}>Section detail</div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>Clinics waste 2hrs/day on manual intake paperwork</div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>Staff burnout from repetitive data entry</div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>Patient wait times increase 15+ min</div>
            </div>
            <div style={{ fontSize: 7, marginTop: 10, opacity: 0.5 }}>Extracted from transcript at 0:42</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Filter Overlay">
          <Phone>
            <Hdr title="Sections" center />
            <div style={{ fontSize: 7, margin: "4px 0", fontWeight: "bold" }}>VIEW BY</div>
            <div className="fv-list-item">
              <div className="fv-radio filled" />
              <span>All Sections</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-radio" />
              <span>Complete Only</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-radio" />
              <span>Missing Only</span>
            </div>
            <div style={{ borderTop: "1.5px solid #111", margin: "8px 0 4px", paddingTop: 4, fontSize: 7, fontWeight: "bold" }}>
              FILTER
            </div>
            <div className="fv-list-item">
              <div className="fv-checkbox checked" />
              <span>Problem</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-checkbox checked" />
              <span>Solution</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-checkbox checked" />
              <span>Market</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-checkbox" />
              <span>Missing sections</span>
            </div>
          </Phone>
        </ScreenWrap>
      </div>

      {/* ROW 4: US3 */}
      <RowLabel>
        User Story 3 — Review and Edit Claims <span>#ClaimReview #ClaimEditing #ClaimRejection</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Claims List">
          <Phone tall>
            <Hdr left="‹" title="Claims" right="CONFIRM ALL" />
            <div className="fv-tabs">
              <div className="on">Pending (5)</div>
              <div>Confirmed</div>
              <div>Rejected</div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>$8K MRR</strong> <span className="fv-badge source">voice</span>
                <div className="fv-meta">Traction · stated at 2:14</div>
              </div>
              <span>✎ 🗑</span>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>12 pilot clinics</strong> <span className="fv-badge source">voice</span>
                <div className="fv-meta">Traction · stated at 2:08</div>
              </div>
              <span>✎ 🗑</span>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>$4.2B TAM</strong> <span className="fv-badge assumption">assumed</span>
                <div className="fv-meta">Market · needs review</div>
              </div>
              <span>✎ 🗑</span>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Edit Claim">
          <Phone>
            <Hdr left="‹" title="Edit Claim" right="SAVE" />
            <div style={{ fontSize: 7, margin: "4px 0" }}>Claim text</div>
            <div className="fv-textarea" style={{ height: 30, padding: 3, fontSize: 7 }}>
              $8K MRR from 12 pilot clinics
            </div>
            <div className="fv-field-row">
              <span>Section: Traction</span>
              <span>›</span>
            </div>
            <div className="fv-field-row">
              <span>Source: Voice (2:14)</span>
              <span>›</span>
            </div>
            <div className="fv-field-row">
              <span>Confidence: High</span>
              <span>›</span>
            </div>
            <div className="fv-list-item" style={{ marginTop: 8, border: "none" }}>
              <div className="fv-checkbox checked" />
              <span>Mark as confirmed</span>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Reject Confirmation">
          <OverlayCard
            title="Reject Claim?"
            body='Are you sure you want to reject "$4.2B TAM"? It will not be included in your pitch.'
            cancel="Cancel"
            confirm="Reject"
          />
        </ScreenWrap>
      </div>

      {/* ROW 5: US4 */}
      <RowLabel>
        User Story 4 — Identify Gaps &amp; Answer Questions{" "}
        <span>#GapIdentification #FollowUpQuestions</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Identified Gaps">
          <Phone tall>
            <Hdr left="‹" title="Gaps Found" right="3" />
            <div style={{ fontSize: 7, marginBottom: 6, opacity: 0.6 }}>Missing or unclear information</div>
            <div className="fv-section-card missing">
              <strong>Business Model</strong>
              <div style={{ marginTop: 2 }}>How do you charge customers?</div>
            </div>
            <div className="fv-section-card missing">
              <strong>Competition</strong>
              <div style={{ marginTop: 2 }}>Who are your main competitors?</div>
            </div>
            <div className="fv-section-card missing">
              <strong>Team</strong>
              <div style={{ marginTop: 2 }}>Founder backgrounds not mentioned</div>
            </div>
            <div className="fv-btn fv-btn-fill" style={{ marginTop: 8 }}>
              ANSWER QUESTIONS
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Follow-up Question">
          <Phone>
            <Hdr left="‹" title="Question 1/3" right="SKIP" />
            <div style={{ fontSize: 7, opacity: 0.6, marginBottom: 4 }}>Business Model · Critical</div>
            <div style={{ fontSize: 9, fontWeight: "bold", margin: "10px 0", lineHeight: 1.3 }}>
              How do you plan to charge your clinic customers?
            </div>
            <div style={{ fontSize: 7, margin: "8px 0 2px" }}>Your answer</div>
            <div className="fv-textarea" style={{ height: 60 }} />
            <div className="fv-segment" style={{ marginTop: 6 }}>
              <div className="active">TEXT</div>
              <div>🎙 VOICE</div>
            </div>
            <div className="fv-btn fv-btn-fill">SUBMIT ANSWER</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Answer Confirmed">
          <Phone>
            <Hdr left="‹" title="Answer Saved" right="NEXT ›" />
            <div style={{ textAlign: "center", margin: "16px 0", fontSize: 24 }}>✓</div>
            <div style={{ textAlign: "center", fontSize: 8 }}>Response saved to Business Model</div>
            <div className="fv-section-card" style={{ marginTop: 12 }}>
              <strong>Added:</strong>
              <div style={{ marginTop: 2 }}>$299/mo per clinic · SaaS subscription</div>
            </div>
            <div className="fv-progress-bar" style={{ marginTop: 16 }}>
              <div className="fill" style={{ width: "33%" }} />
            </div>
            <div style={{ fontSize: 7, textAlign: "center" }}>1 of 3 questions answered</div>
          </Phone>
        </ScreenWrap>
      </div>

      {/* ROW 6: US5 & US6 */}
      <RowLabel>
        User Story 5 &amp; 6 — Generate Pitch Deck &amp; Financial Model{" "}
        <span>#PitchDeckGeneration #FinancialModel</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Generate Outputs">
          <Phone>
            <Hdr left="‹" title="Generate" right="" />
            <div style={{ fontSize: 7, margin: "6px 0", opacity: 0.6 }}>From confirmed business info</div>
            <div className="fv-list-item" style={{ padding: "8px 2px" }}>
              <div className="fv-doc-icon" />
              <div style={{ flex: 1 }}>
                <strong>Pitch Deck</strong>
                <div className="fv-meta">PPTX · ~12 slides</div>
              </div>
              <div className="fv-btn fv-btn-fill" style={{ margin: 0, padding: "3px 6px", fontSize: 7 }}>
                GEN
              </div>
            </div>
            <div className="fv-list-item" style={{ padding: "8px 2px" }}>
              <div className="fv-doc-icon" />
              <div style={{ flex: 1 }}>
                <strong>Financial Model</strong>
                <div className="fv-meta">XLSX · 3-year projections</div>
              </div>
              <div className="fv-btn fv-btn-fill" style={{ margin: 0, padding: "3px 6px", fontSize: 7 }}>
                GEN
              </div>
            </div>
            <div className="fv-list-item" style={{ padding: "8px 2px", opacity: 0.5 }}>
              <div className="fv-doc-icon" />
              <div style={{ flex: 1 }}>
                <strong>Diligence Pack</strong>
                <div className="fv-meta">Complete all sections first</div>
              </div>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Pitch Deck Preview">
          <Phone tall>
            <Hdr left="‹" title="Pitch Deck" right="EXPORT" />
            <div className="fv-slide-thumb">
              <strong>1.</strong> Title · Acme AI
            </div>
            <div className="fv-slide-thumb">
              <strong>2.</strong> Problem · Clinic paperwork
            </div>
            <div className="fv-slide-thumb">
              <strong>3.</strong> Solution · Voice AI intake
            </div>
            <div className="fv-slide-thumb">
              <strong>4.</strong> Market · $4.2B TAM
            </div>
            <div className="fv-slide-thumb">
              <strong>5.</strong> Traction · 12 pilots · $8K MRR
            </div>
            <div className="fv-slide-thumb">
              <strong>6.</strong> Business Model · $299/mo
            </div>
            <div className="fv-slide-thumb" style={{ opacity: 0.5 }}>
              <strong>7.</strong> Team · …
            </div>
            <div style={{ fontSize: "6.5px", marginTop: 4, opacity: 0.5 }}>Matches confirmed claims only</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Financial Model">
          <Phone tall>
            <Hdr left="‹" title="Financial Model" right="EXPORT" />
            <div style={{ fontSize: 7, fontWeight: "bold", margin: "4px 0" }}>Revenue Projections</div>
            <div style={{ fontSize: "6.5px", border: "1px solid #111", padding: 3, marginBottom: 6 }}>
              Y1: $96K · Y2: $480K · Y3: $1.2M
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>$299/mo per clinic</strong>
                <div className="fv-meta">
                  <span className="fv-badge source">founder-provided</span>
                </div>
              </div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>40 clinics by Y2</strong>
                <div className="fv-meta">
                  <span className="fv-badge assumption">assumption</span>
                </div>
              </div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>15% churn rate</strong>
                <div className="fv-meta">
                  <span className="fv-badge assumption">benchmark</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: "6.5px", marginTop: 6, opacity: 0.5 }}>Assumptions clearly labeled</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Slide Detail">
          <Phone>
            <Hdr left="‹" title="Slide 2" right="EDIT" />
            <div style={{ border: "1.5px solid #111", height: 120, padding: 6, margin: "4px 0", fontSize: 7 }}>
              <strong style={{ fontSize: 9 }}>The Problem</strong>
              <div style={{ marginTop: 8, lineHeight: 1.4 }}>
                Small clinics waste 2+ hours daily on manual patient intake paperwork, leading to staff
                burnout and longer wait times.
              </div>
            </div>
            <div style={{ fontSize: "6.5px", opacity: 0.5 }}>Source: Confirmed claim · Traction section</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10 }}>
              <span>‹</span>
              <span>2 / 12</span>
              <span>›</span>
            </div>
          </Phone>
        </ScreenWrap>
      </div>

      {/* ROW 7: US7 */}
      <RowLabel>
        User Story 7 — Review and Edit Pitch <span>#PitchReview #PitchEditing</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Edit Slide Content">
          <Phone>
            <Hdr left="‹" title="Edit Slide" right="SAVE" />
            <div style={{ fontSize: 7, margin: "4px 0" }}>Slide title</div>
            <div className="fv-input-box" style={{ padding: "2px 4px", fontSize: 7, display: "flex", alignItems: "center" }}>
              The Problem
            </div>
            <div style={{ fontSize: 7, margin: "6px 0 2px" }}>Slide content</div>
            <div className="fv-textarea" style={{ height: 80, padding: 4, fontSize: "6.5px", lineHeight: 1.3 }}>
              Small clinics waste 2+ hours daily on manual patient intake paperwork…
            </div>
            <div className="fv-field-row">
              <span>Linked claims (2)</span>
              <span>›</span>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Link Claims to Slide">
          <Phone>
            <Hdr left="‹" title="Linked Claims" right="" />
            <div className="fv-list-item">
              <div className="fv-checkbox checked" />
              <div style={{ flex: 1 }}>Clinics waste 2hrs/day on paperwork</div>
            </div>
            <div className="fv-list-item">
              <div className="fv-checkbox checked" />
              <div style={{ flex: 1 }}>Patient wait times +15 min</div>
            </div>
            <div className="fv-list-item">
              <div className="fv-checkbox" />
              <div style={{ flex: 1 }}>$4.2B TAM (Market slide)</div>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Discard Changes Dialog">
          <OverlayCard
            title="Discard Changes?"
            body="Are you sure you want to discard the changes made to this slide?"
            cancel="Cancel"
            confirm="Discard"
          />
        </ScreenWrap>
      </div>

      {/* ROW 8: US8 */}
      <RowLabel>
        User Story 8 — Practice Investor Questions <span>#MockInvestorSession #AnswerFeedback</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Start Practice">
          <Phone>
            <Hdr left="‹" title="Practice" right="" />
            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <div style={{ fontSize: 11, fontWeight: "bold" }}>Mock Investor Session</div>
              <div style={{ fontSize: 7, marginTop: 4, opacity: 0.6 }}>Based on your business profile</div>
            </div>
            <div className="fv-field-row">
              <span>Session length</span>
              <span>›</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-radio filled" />
              <span>Quick (5 questions)</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-radio" />
              <span>Standard (10 questions)</span>
            </div>
            <div className="fv-list-item">
              <div className="fv-radio" />
              <span>Deep dive (20 questions)</span>
            </div>
            <div className="fv-btn fv-btn-fill" style={{ marginTop: 12 }}>
              START SESSION
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Investor Question">
          <Phone>
            <Hdr left="‹" title="Q 3/10" right="⏱ 0:45" />
            <div style={{ fontSize: 7, opacity: 0.6, marginBottom: 4 }}>Investor · Traction</div>
            <div style={{ fontSize: 9, fontWeight: "bold", margin: "10px 0", lineHeight: 1.3 }}>
              &ldquo;You said $8K MRR — what&apos;s your monthly growth rate and how do you retain
              clinics?&rdquo;
            </div>
            <div style={{ fontSize: 7, margin: "8px 0 2px" }}>Your answer</div>
            <div className="fv-textarea" style={{ height: 55 }} />
            <div className="fv-segment">
              <div className="active">TEXT</div>
              <div>🎙 VOICE</div>
            </div>
            <div className="fv-btn fv-btn-fill">SUBMIT</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Answer Feedback">
          <Phone tall>
            <Hdr left="‹" title="Feedback" right="NEXT ›" />
            <div className="fv-feedback-box">
              <div style={{ fontWeight: "bold", marginBottom: 3 }}>Score: 6/10</div>
              <div>You mentioned MRR but didn&apos;t address retention or churn. Investors will push on this.</div>
            </div>
            <div style={{ fontSize: 7, fontWeight: "bold", margin: "6px 0" }}>Suggested improvement:</div>
            <div style={{ fontSize: 7, lineHeight: 1.3 }}>
              &ldquo;We grow 12% MoM with 95% retention. Churn is mainly from clinics closing, not product
              issues.&rdquo;
            </div>
            <div style={{ fontSize: 7, marginTop: 8, opacity: 0.5 }}>Weak area: Traction metrics</div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Session Results">
          <Phone>
            <Hdr left="‹" title="Session Results" right="" />
            <div className="fv-score-ring">68</div>
            <div style={{ textAlign: "center", fontSize: 8, marginBottom: 10 }}>Overall readiness score</div>
            <div style={{ fontSize: 7, fontWeight: "bold", marginBottom: 4 }}>Areas to improve:</div>
            <div className="fv-list-item">
              <span>★</span>
              <span>Traction metrics (weak)</span>
            </div>
            <div className="fv-list-item">
              <span>★</span>
              <span>Competitive moat (missing)</span>
            </div>
            <div className="fv-list-item">
              <span style={{ opacity: 0.3 }}>★</span>
              <span>Market size (strong)</span>
            </div>
            <div className="fv-btn fv-btn-outline" style={{ marginTop: 8 }}>
              PRACTICE AGAIN
            </div>
          </Phone>
        </ScreenWrap>
      </div>

      {/* ROW 9: US9 & US10 */}
      <RowLabel>
        User Story 9 &amp; 10 — Investor: Claim Sources &amp; Diligence Pack{" "}
        <span>#ClaimSources #DiligencePack #InvestorView</span>
      </RowLabel>
      <div className="fv-wall-row">
        <ScreenWrap label="Investor · Claims w/ Sources">
          <Phone tall>
            <Hdr left="‹" title="Acme AI" right="SHARE" />
            <div className="fv-segment">
              <div>OVERVIEW</div>
              <div className="active">CLAIMS</div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>$8K MRR</strong>
                <div className="fv-meta">
                  <span className="fv-badge source">founder-provided</span> · transcript 2:14
                </div>
              </div>
              <span>›</span>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>$4.2B TAM</strong>
                <div className="fv-meta">
                  <span className="fv-badge assumption">benchmark</span> · industry report
                </div>
              </div>
              <span>›</span>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>40 clinics by Y2</strong>
                <div className="fv-meta">
                  <span className="fv-badge assumption">assumption</span> · model projection
                </div>
              </div>
              <span>›</span>
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Claim Source Detail">
          <Phone>
            <Hdr left="‹" title="Claim Detail" right="" />
            <div style={{ fontSize: 10, fontWeight: "bold", margin: "8px 0" }}>$8K MRR</div>
            <div className="fv-field-row">
              <span>Source type</span>
              <span>Founder-provided</span>
            </div>
            <div className="fv-field-row">
              <span>Origin</span>
              <span>Voice transcript</span>
            </div>
            <div className="fv-field-row">
              <span>Timestamp</span>
              <span>2:14 in recording</span>
            </div>
            <div className="fv-field-row">
              <span>Confirmed by founder</span>
              <span>✓ Yes</span>
            </div>
            <div style={{ fontSize: 7, marginTop: 10, fontWeight: "bold" }}>Original quote:</div>
            <div
              style={{
                fontSize: "6.5px",
                marginTop: 3,
                lineHeight: 1.3,
                borderLeft: "2px solid #111",
                paddingLeft: 4,
              }}
            >
              &ldquo;We have 12 pilot clinics and we&apos;re at about eight thousand dollars MRR right
              now.&rdquo;
            </div>
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Diligence Pack">
          <Phone tall>
            <Hdr left="‹" title="Diligence Pack" right="⬇" />
            <div style={{ fontSize: 7, marginBottom: 6, opacity: 0.6 }}>Acme AI · Complete pack</div>
            {[
              ["Pitch Deck", "12 slides · PPTX"],
              ["Financial Model", "3-year · XLSX"],
              ["FAQ", "18 Q&A pairs"],
              ["Claim Graph", "24 claims · sourced"],
              ["Supporting Evidence", "Transcript · recordings"],
            ].map(([title, meta]) => (
              <div key={title} className="fv-list-item" style={{ padding: "6px 2px" }}>
                <div className="fv-doc-icon" />
                <div style={{ flex: 1 }}>
                  <strong>{title}</strong>
                  <div className="fv-meta">{meta}</div>
                </div>
                <span>›</span>
              </div>
            ))}
          </Phone>
        </ScreenWrap>

        <ScreenWrap label="Financial Provenance">
          <Phone>
            <Hdr left="‹" title="Financial Model" right="⬇" />
            <div style={{ fontSize: 7, margin: "4px 0" }}>Assumption provenance</div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>$299/mo pricing</strong>
                <div className="fv-meta">
                  <span className="fv-badge source">founder-provided</span>
                </div>
              </div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>15% churn</strong>
                <div className="fv-meta">
                  <span className="fv-badge assumption">benchmark</span> · SaaS avg
                </div>
              </div>
            </div>
            <div className="fv-list-item">
              <div style={{ flex: 1 }}>
                <strong>40 clinics Y2</strong>
                <div className="fv-meta">
                  <span className="fv-badge assumption">assumption</span> · growth model
                </div>
              </div>
            </div>
            <div className="fv-btn fv-btn-outline" style={{ marginTop: 8, fontSize: 7 }}>
              VIEW FULL MODEL
            </div>
          </Phone>
        </ScreenWrap>
      </div>

      <div className="fv-print-note">
        PitchOS ships the FounderVoice vision — voice to verified claim graph to investor-ready pack.
        <br />
        Agents draft. Founders confirm. No invented numbers.
      </div>
    </div>
  );
}
