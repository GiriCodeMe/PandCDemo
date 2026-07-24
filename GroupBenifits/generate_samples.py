#!/usr/bin/env python3
"""Generate Acme Corp Group Benefits sample PDF documents using Python stdlib only."""

import io
import textwrap
from pathlib import Path

OUT_DIR = Path(__file__).parent / "samples"
OUT_DIR.mkdir(exist_ok=True)


class Doc:
    """
    Minimal PDF writer — no external libraries.
    Each text element uses its own BT...ET block with absolute Tm positioning.
    Graphics operators (lines, fills) appear between BT blocks, never inside them.
    """

    PAGE_W, PAGE_H = 612, 792
    ML, MR, MT, MB = 72, 540, 750, 72
    LH = 14
    UW = 468   # MR - ML

    def __init__(self, title="Document"):
        self.title = title
        self._pages = []   # list[list[str]]  — completed pages
        self._cur = []     # current page lines (raw PDF ops)
        self._y = self.MT

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _ensure(self):
        """Start a page if none is open."""
        if self._cur is None:
            self._cur = []
            self._y = self.MT

    def _need(self, n=1):
        """Ensure n lines of vertical space remain; overflow to a new page."""
        if self._cur is None:
            self._cur = []
            self._y = self.MT
        if self._y - n * self.LH < self.MB:
            self._pages.append(self._cur)
            self._cur = []
            self._y = self.MT

    def _esc(self, t):
        return str(t).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    def _text(self, x, y, s, font="F1", size=10):
        """Emit one absolute-positioned text element in its own BT/ET block."""
        self._cur.append(
            f"BT /{font} {size} Tf 1 0 0 1 {int(x)} {int(y)} Tm ({self._esc(s)}) Tj ET"
        )

    # ── Public content primitives ─────────────────────────────────────────────

    def blank(self, n=1):
        self._need(n)
        self._y -= self.LH * n

    def write(self, text, size=10, bold=False, indent=0):
        font = "F2" if bold else "F1"
        avail = self.UW - indent
        chars = max(40, int(avail / (size * 0.56)))
        lines = textwrap.wrap(str(text), width=chars) or [""]
        for ln in lines:
            self._need(1)
            self._text(self.ML + indent, self._y, ln, font, size)
            self._y -= self.LH

    def h1(self, t):
        self.blank(2)
        self.write(t, 16, True)
        self.blank(1)

    def h2(self, t):
        self.blank(1)
        self.write(t, 13, True)

    def h3(self, t):
        self.write(t, 11, True)

    def p(self, t, indent=0, bold=False):
        self.write(t, 10, bold=bold, indent=indent)

    def li(self, t):
        self._need(1)
        self._text(self.ML + 8, self._y, "-", "F1", 10)
        self.write(t, 10, indent=20)

    def rule(self):
        self._need(2)
        y = int(self._y - 2)
        self._cur.append(f"0.6 G {self.ML} {y} m {self.MR} {y} l S 0 G")
        self._y -= self.LH

    def table(self, headers, rows, widths=None):
        n = len(headers)
        if widths is None:
            w = self.UW // n
            widths = [w] * n
        rh = 16

        def emit_row(cols, bold=False):
            self._need(2)
            font = "F2" if bold else "F1"
            x = self.ML
            for i, c in enumerate(cols):
                self._text(x + 4, self._y, str(c)[:40], font, 9)
                x += widths[i]
            self._y -= rh

        emit_row(headers, bold=True)
        for r in rows:
            emit_row(r)

    def page_break(self):
        self._pages.append(self._cur)
        self._cur = []
        self._y = self.MT

    # ── File assembly ─────────────────────────────────────────────────────────

    def save(self, path: Path):
        # Flush current page if it has content
        if self._cur:
            self._pages.append(self._cur)
            self._cur = []

        buf = io.BytesIO()
        off = {}

        def w(s):
            if isinstance(s, str):
                buf.write(s.encode("latin-1", errors="replace"))
            else:
                buf.write(s)

        def obj(n):
            off[n] = buf.tell()
            w(f"{n} 0 obj\n")

        def endobj():
            w("endobj\n")

        w(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

        # Fixed objects: catalog (1), fonts (3, 4)
        obj(1); w("<< /Type /Catalog /Pages 2 0 R >>\n"); endobj()
        obj(3); w("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica "
                  "/Encoding /WinAnsiEncoding >>\n"); endobj()
        obj(4); w("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold "
                  "/Encoding /WinAnsiEncoding >>\n"); endobj()

        # Content + Page pairs starting at object 5
        page_ids = []
        n = 5
        for page_lines in self._pages:
            stream = "\n".join(page_lines).encode("latin-1", errors="replace")
            obj(n)
            w(f"<< /Length {len(stream)} >>\nstream\n")
            w(stream)
            w("\nendstream\n")
            endobj()
            cid = n; n += 1

            obj(n)
            w(f"<< /Type /Page /Parent 2 0 R "
              f"/MediaBox [0 0 {self.PAGE_W} {self.PAGE_H}] "
              f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
              f"/Contents {cid} 0 R >>\n")
            endobj()
            page_ids.append(n); n += 1

        # Pages dictionary (object 2)
        kids = " ".join(f"{p} 0 R" for p in page_ids)
        obj(2)
        w(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>\n")
        endobj()

        # Cross-reference table
        xref_pos = buf.tell()
        total = max(off.keys()) + 1
        w(f"xref\n0 {total}\n")
        w("0000000000 65535 f \n")
        for i in range(1, total):
            if i in off:
                w(f"{off[i]:010d} 00000 n \n")
            else:
                w("0000000000 65535 f \n")

        w(f"trailer\n<< /Size {total} /Root 1 0 R >>\n")
        w(f"startxref\n{xref_pos}\n%%EOF\n")

        path.write_bytes(buf.getvalue())
        print(f"  Created: {path.name}  ({path.stat().st_size:,} bytes)")


# ════════════════════════════════════════════════════════════════════════════════
# DOCUMENT 1 — Acme 2027 Benefits Guide
# ════════════════════════════════════════════════════════════════════════════════

def build_benefits_guide():
    d = Doc("Acme 2027 Benefits Guide")

    d.h1("ACME CORPORATION")
    d.write("2027 Employee Benefits Guide", 14, True)
    d.blank(1)
    d.p("Your guide to health, wellness, financial security, and employee benefits.")
    d.blank(1)
    d.p("Plan Year: January 1, 2027 - December 31, 2027")
    d.p("Open Enrollment: November 1 - November 30, 2026")
    d.rule()

    # Section 1 — Welcome
    d.h2("Section 1 - Welcome")
    d.p("Acme Corporation is committed to providing competitive employee benefits that support your "
        "health, financial security, and well-being. This guide explains the benefits available to "
        "you and your eligible dependents for the 2027 plan year.")
    d.blank(1)
    d.h3("Important Dates")
    d.table(
        ["Event", "Date"],
        [
            ["Open Enrollment Begins", "November 1, 2026"],
            ["Open Enrollment Ends", "November 30, 2026"],
            ["Elections Finalized", "December 5, 2026"],
            ["Carrier File Transmission", "December 15, 2026"],
            ["Plan Effective Date", "January 1, 2027"],
        ],
        widths=[280, 188]
    )

    # Section 2 — Eligibility
    d.h2("Section 2 - Eligibility")
    d.p("The following rules govern eligibility for Acme Corporation benefits:")
    d.blank(1)
    d.li("Full-time employees regularly scheduled to work at least 30 hours per week are eligible "
         "for medical benefits.")
    d.li("Employees become eligible after completing 30 days of employment.")
    d.li("Coverage begins on the first day of the month following completion of the waiting period.")
    d.li("Part-time employees regularly scheduled to work at least 20 hours per week are eligible "
         "for Dental and Vision benefits.")
    d.li("Employees on approved leave may continue coverage subject to applicable plan rules.")
    d.blank(1)
    # INTENTIONAL AMBIGUITY — AI should flag this
    d.p("[NOTE - INTENTIONAL AMBIGUITY FOR AI DEMO]")
    d.p("Coverage effective dates may be subject to plan-specific provisions. Please refer to "
        "your plan documents for complete details regarding when coverage begins.")
    d.p("(AI DEMO: The above conflicts with the first-of-month rule above. AI should flag this.)")

    # Section 3 — Medical
    d.h2("Section 3 - Medical Benefits")
    d.p("Acme Corporation offers two medical plan options for 2027:")
    d.blank(1)
    d.h3("PPO 500 Plan (MED-PPO-500)")
    d.p("Network: Aetna Choice POS II")
    d.blank(1)
    d.table(
        ["Coverage Tier", "Deductible", "OOP Max", "Monthly Cost"],
        [
            ["Employee Only", "$500", "$3,000", "$600"],
            ["Employee + Spouse", "$500", "$3,000", "$1,100"],
            ["Employee + Child", "$500", "$3,000", "$950"],
            ["Employee + Children", "$500", "$3,000", "$1,050"],
            ["Family", "$500", "$3,000", "$1,500"],
        ],
        widths=[140, 100, 100, 128]
    )
    d.blank(1)
    d.p("Employer Contribution: $450 per month. Employee contribution is the difference between "
        "total premium and employer contribution.")
    d.blank(1)
    d.h3("HDHP 3000 Plan (MED-HDHP-3000)")
    d.p("High-Deductible Health Plan. HSA-compatible.")
    d.blank(1)
    d.table(
        ["Coverage Tier", "Deductible", "OOP Max", "Monthly Cost"],
        [
            ["Employee Only", "$3,000", "$6,000", "$400"],
            ["Employee + Spouse", "$3,000", "$6,000", "$800"],
            ["Employee + Child", "$3,000", "$6,000", "$700"],
            ["Family", "$3,000", "$6,000", "$1,100"],
        ],
        widths=[140, 100, 100, 128]
    )
    d.blank(1)
    d.p("Employer Contribution: $350 per month.")

    # Section 4 — Dental
    d.h2("Section 4 - Dental Benefits")
    d.p("Eligible employees may choose from two dental plan options.")
    d.blank(1)
    d.h3("Dental Basic (DEN-BASIC)")
    d.table(
        ["Tier", "Deductible", "Annual Max", "Monthly Cost"],
        [
            ["Employee Only", "$50", "$1,500", "$40"],
            ["Employee + Spouse", "$50", "$1,500", "$80"],
            ["Employee + Child", "$50", "$1,500", "$70"],
            ["Family", "$50", "$1,500", "$120"],
        ],
        widths=[130, 100, 110, 128]
    )
    d.blank(1)
    d.h3("Dental Premium (DEN-PREM)")
    d.table(
        ["Tier", "Deductible", "Annual Max", "Monthly Cost"],
        [
            ["Employee Only", "$25", "$2,500", "$65"],
            ["Employee + Spouse", "$25", "$2,500", "$130"],
            ["Employee + Child", "$25", "$2,500", "$115"],
            ["Family", "$25", "$2,500", "$180"],
        ],
        widths=[130, 100, 110, 128]
    )
    d.blank(1)
    d.p("Employer Contribution: $25 per month for Dental Basic; $25 per month for Dental Premium.")

    # Section 5 — Vision
    d.h2("Section 5 - Vision Benefits")
    d.p("Vision Standard plan (VIS-STD) is available to all eligible employees.")
    d.blank(1)
    d.table(
        ["Benefit", "Coverage"],
        [
            ["Exam Copay", "$10"],
            ["Frames (every 24 months)", "Up to $150 retail"],
            ["Lenses", "Covered in full"],
            ["Contact Lenses", "Up to $150 per year"],
        ],
        widths=[250, 218]
    )
    d.blank(1)
    d.table(
        ["Tier", "Monthly Cost"],
        [
            ["Employee Only", "$15"],
            ["Family", "$40"],
        ],
        widths=[280, 188]
    )
    d.blank(1)
    d.p("Employer Contribution: $10 per month.")

    # Section 6 — Life and Disability
    d.h2("Section 6 - Life and Disability")
    d.blank(1)
    d.h3("Basic Life Insurance (LIFE-BASIC)")
    d.li("Coverage: 1x annual salary, up to $500,000")
    d.li("100% employer-paid -- no cost to the employee")
    d.li("Automatic enrollment for all eligible employees")
    d.blank(1)
    d.h3("Voluntary Life Insurance (LIFE-VOL)")
    d.li("Employee-paid coverage in increments of $10,000")
    d.li("Maximum coverage: $500,000")
    d.li("Evidence of Insurability (EOI) required for coverage above $100,000 or for late enrollees")
    d.blank(1)
    d.h3("Short-Term Disability (DIS-STD)")
    d.li("60% of base weekly earnings")
    d.li("Benefit period: up to 12 weeks")
    d.li("Employer pays 50% of premium")
    d.blank(1)
    d.h3("Long-Term Disability (DIS-LTD)")
    d.li("60% of base monthly earnings")
    d.li("Benefit period: to age 65")
    d.li("Employer pays 50% of premium")

    # Section 7 — Dependent Eligibility
    d.h2("Section 7 - Dependent Eligibility")
    d.p("The following dependents are eligible for coverage under Acme Corporation benefit plans:")
    d.blank(1)
    d.li("A legal spouse may be covered.")
    d.li("A domestic partner may be covered. Imputed income rules apply.")
    d.li("Dependent children may be covered until the end of the month in which they reach age 26.")
    d.li("Disabled dependents may qualify for continued coverage subject to plan provisions.")
    d.li("Documentation may be required to verify dependent eligibility.")
    d.blank(1)
    # INTENTIONAL AMBIGUITY — AI demo
    d.p("Employees should notify HR promptly following a qualifying life event.")
    d.p("(AI DEMO: 'Promptly' is ambiguous. AI should ask: What is the required notification period?)")

    # Section 8 — Life Events
    d.h2("Section 8 - Qualifying Life Events")
    d.p("Outside of open enrollment, you may change your benefit elections within 30 days of a "
        "qualifying life event.")
    d.blank(1)
    d.table(
        ["Life Event", "Allowed Change"],
        [
            ["Marriage", "Add spouse / change coverage tier"],
            ["Divorce", "Remove spouse / change coverage tier"],
            ["Birth of Child", "Add child / change coverage tier"],
            ["Adoption", "Add child / change coverage tier"],
            ["Loss of Other Coverage", "Enroll in or change coverage"],
            ["Death of Dependent", "Remove dependent / change tier"],
            ["Employment Status Change", "Change or terminate coverage"],
        ],
        widths=[220, 248]
    )

    # Section 9 — Enrollment Process
    d.h2("Section 9 - Enrollment Process")
    d.p("To enroll in or change your benefits, log into the Acme Benefits Portal during the open "
        "enrollment period and follow these steps:")
    d.blank(1)
    d.li("Step 1: Log into the Benefits Portal using your employee credentials")
    d.li("Step 2: Review your eligible benefits and current elections")
    d.li("Step 3: Select coverage levels for each benefit type")
    d.li("Step 4: Add eligible dependents and provide required documentation")
    d.li("Step 5: Review your total cost and employer contributions")
    d.li("Step 6: Confirm your elections before the enrollment deadline")
    d.blank(1)
    # INTENTIONAL AMBIGUITY — AI demo
    d.p("Employees who do not actively enroll will be automatically enrolled in default coverage.")
    d.p("(AI DEMO: What is the default medical plan? AI should ask this question.)")

    # Section 10 — Payroll Deductions
    d.h2("Section 10 - Payroll Deductions")
    # INTENTIONAL CONFLICT — AI demo
    d.p("Employee benefit contributions are deducted from your monthly paycheck.")
    d.blank(1)
    d.table(
        ["Plan", "Employee Monthly Cost", "Payroll Deduction"],
        [
            ["PPO 500 (EE Only)", "$150/month", "$75/paycheck"],
            ["HDHP 3000 (EE Only)", "$50/month", "$25/paycheck"],
            ["Dental Basic (EE Only)", "$15/month", "$7.50/paycheck"],
            ["Dental Premium (EE Only)", "$40/month", "$20/paycheck"],
            ["Vision Standard (EE Only)", "$5/month", "$2.50/paycheck"],
        ],
        widths=[175, 150, 143]
    )
    d.blank(1)
    d.p("Deductions are taken from each paycheck on a pre-tax basis where permitted by law.")
    d.p("(AI DEMO: CONFLICT - Section 10 first says 'monthly paycheck' then 'each paycheck'. "
        "These statements are inconsistent. AI should detect this conflict.)")

    # Section 11 — Carrier Integration
    d.h2("Section 11 - Carrier and Integration Rules")
    d.p("Acme Corporation transmits enrollment information to benefit carriers on the following schedule:")
    d.blank(1)
    d.table(
        ["Carrier / Benefit", "Transmission Frequency", "Method"],
        [
            ["Medical (Aetna)", "Daily", "REST API"],
            ["Dental (Delta Dental)", "Weekly", "SFTP"],
            ["Vision (VSP)", "Weekly", "CSV File"],
            ["Life / AD&D (MetLife)", "Weekly", "SFTP"],
            ["Disability (Life Carrier)", "Daily", "REST API"],
        ],
        widths=[180, 148, 140]
    )
    d.blank(1)
    d.p("Required fields for all carrier transmissions:")
    d.li("Employee ID and Employee Name")
    d.li("Social Security Number (SSN)")
    d.li("Plan Code and Coverage Tier")
    d.li("Coverage Effective Date")
    d.li("Dependent information (name, DOB, relationship, SSN)")
    d.blank(1)
    d.p("Payroll deduction updates must be transmitted to the payroll system before the next "
        "payroll cycle following any enrollment change.")

    # Section 12 — Important Dates
    d.h2("Section 12 - Important Dates and Contacts")
    d.table(
        ["Event", "Date"],
        [
            ["Open Enrollment Begins", "November 1, 2026"],
            ["Open Enrollment Ends", "November 30, 2026"],
            ["Elections Finalized", "December 5, 2026"],
            ["Carrier File Transmission", "December 15, 2026"],
            ["Plan Effective Date", "January 1, 2027"],
            ["Renewal Date", "January 1, 2028"],
        ],
        widths=[280, 188]
    )
    d.blank(1)
    d.p("For questions regarding your benefits, contact Acme HR at benefits@acmecorp.com or "
        "call 1-800-ACME-HR.")

    d.save(OUT_DIR / "Acme_2027_Benefits_Guide.pdf")


# ════════════════════════════════════════════════════════════════════════════════
# DOCUMENT 2 — Acme Eligibility Policy
# ════════════════════════════════════════════════════════════════════════════════

def build_eligibility_policy():
    d = Doc("Acme Eligibility Policy")

    d.h1("ACME CORPORATION")
    d.write("Benefits Eligibility Policy", 14, True)
    d.blank(1)
    d.p("Document ID: POL-ELIG-2027  |  Version: 2.1  |  Effective: January 1, 2027")
    d.rule()

    d.h2("1. Purpose")
    d.p("This policy defines the eligibility criteria for participation in Acme Corporation "
        "sponsored benefit plans. All employees and benefit administrators must follow this "
        "policy when determining benefit eligibility.")

    d.h2("2. Employee Eligibility -- Medical")
    d.p("An employee is eligible for Medical benefits if ALL of the following conditions are met:")
    d.li("Employment Status = Active")
    d.li("Employment Type = Full-time (not part-time, contractor, or temporary)")
    d.li("Scheduled hours per week >= 30")
    d.li("Tenure from Hire Date >= 30 days")
    d.blank(1)
    d.p("Waiting Period: Coverage begins on the first day of the month following the 30-day waiting period.")
    d.blank(1)
    # INTENTIONAL CONFLICT with benefits guide
    d.p("(INTENTIONAL CONFLICT FOR AI DEMO)")
    d.p("Exception: For employees hired on the first day of a month, coverage begins on the first "
        "day of the following month, which may result in a waiting period of less than 30 days.")
    d.p("Note: This conflicts with the general 30-day rule. AI should identify this ambiguity.")

    d.h2("3. Employee Eligibility -- Dental and Vision")
    d.p("An employee is eligible for Dental and Vision benefits if ALL of the following are met:")
    d.li("Employment Status = Active")
    d.li("Scheduled hours per week >= 20")
    d.li("Tenure from Hire Date >= 30 days")
    d.blank(1)
    d.p("Part-time employees working 20-29 hours per week are eligible for Dental and Vision "
        "but are NOT eligible for Medical, Life, or Disability benefits.")

    d.h2("4. Dependent Eligibility Rules")
    d.table(
        ["Dependent Type", "Eligibility Rule", "Age Cutoff"],
        [
            ["Legal Spouse", "Valid marriage certificate required", "N/A"],
            ["Domestic Partner", "Affidavit required; imputed income applies", "N/A"],
            ["Natural Child", "Birth certificate required", "End of month age 26"],
            ["Stepchild", "Marriage certificate + birth certificate", "End of month age 26"],
            ["Adopted Child", "Adoption decree required", "End of month age 26"],
            ["Disabled Dependent", "Physician certification; annual review", "No cutoff"],
        ],
        widths=[140, 200, 128]
    )

    d.h2("5. Waiting Period Details")
    d.p("Rule A: Coverage begins after 30 days of employment.")
    d.blank(1)
    d.p("Rule B: Coverage begins on the first day of the month following 30 days of employment.")
    d.blank(1)
    d.p("(AI DEMO: Rules A and B are intentionally in conflict. Rule A implies day 31. "
        "Rule B implies first of following month, which could be day 31 to day 61. "
        "AI should identify this conflict and ask for clarification.)")

    d.h2("6. Employment Status Definitions")
    d.table(
        ["Status", "Medical", "Dental/Vision", "Life/Disability"],
        [
            ["Active Full-time (>=30 hrs)", "Eligible", "Eligible", "Eligible"],
            ["Active Part-time (20-29 hrs)", "Not Eligible", "Eligible", "Not Eligible"],
            ["Active Part-time (<20 hrs)", "Not Eligible", "Not Eligible", "Not Eligible"],
            ["On Approved Leave (FMLA)", "Eligible", "Eligible", "Eligible"],
            ["On Unpaid Leave", "COBRA continuation", "COBRA continuation", "Terminated"],
            ["Terminated / Inactive", "COBRA", "COBRA", "Terminated"],
        ],
        widths=[175, 80, 100, 113]
    )

    d.h2("7. New Hire Enrollment Window")
    d.p("New employees must enroll within 30 days of their hire date. Failure to enroll within "
        "this window results in automatic enrollment in the default plan.")
    d.blank(1)
    d.p("(AI DEMO: This reinforces the ambiguity about the default plan from the Benefits Guide. "
        "AI should link these two requirements and ask: What is the default medical plan?)")

    d.h2("8. Life Event Enrollment Windows")
    d.table(
        ["Life Event", "Window", "Documentation Required"],
        [
            ["Marriage", "30 days from event date", "Marriage certificate"],
            ["Divorce", "30 days from decree date", "Divorce decree"],
            ["Birth of Child", "30 days from birth date", "Birth certificate"],
            ["Adoption", "30 days from placement", "Adoption decree/placement order"],
            ["Loss of Other Coverage", "30 days from loss date", "Carrier termination letter"],
            ["Death of Dependent", "30 days from death date", "Death certificate"],
        ],
        widths=[170, 130, 168]
    )
    d.blank(1)
    d.p("Changes made outside the enrollment window will not be accepted until the next open "
        "enrollment period, except in cases of special enrollment rights under HIPAA.")

    d.save(OUT_DIR / "Acme_Eligibility_Policy.pdf")


# ════════════════════════════════════════════════════════════════════════════════
# DOCUMENT 3 — Carrier Requirements
# ════════════════════════════════════════════════════════════════════════════════

def build_carrier_requirements():
    d = Doc("Acme Carrier Requirements")

    d.h1("ACME CORPORATION")
    d.write("Carrier Integration Requirements", 14, True)
    d.blank(1)
    d.p("Document ID: INT-CAR-2027  |  Version: 1.3  |  Effective: January 1, 2027")
    d.rule()

    d.h2("1. Overview")
    d.p("This document defines the technical and business requirements for transmitting benefit "
        "enrollment data to Acme Corporation's benefit carriers. All carrier connections must "
        "comply with this specification.")

    d.h2("2. Carrier Connection Summary")
    d.table(
        ["Carrier", "Product", "Method", "Frequency", "Format"],
        [
            ["Aetna", "Medical", "REST API", "Daily", "JSON"],
            ["Delta Dental", "Dental", "SFTP", "Weekly", "CSV/834"],
            ["VSP", "Vision", "CSV Upload", "Weekly", "CSV"],
            ["MetLife", "Life / AD&D", "SFTP", "Weekly", "EDI 834"],
            ["Life Carrier", "STD / LTD", "REST API", "Daily", "JSON"],
            ["Fidelity", "HSA", "REST API", "Monthly", "JSON"],
            ["WEX", "FSA", "REST API", "Monthly", "JSON"],
        ],
        widths=[90, 90, 80, 80, 128]
    )

    d.h2("3. Required Data Fields -- All Carriers")
    d.p("The following fields are required in all carrier transmission records:")
    d.blank(1)
    d.table(
        ["Field Name", "Type", "Format", "Required"],
        [
            ["Employee ID", "String", "EE-NNN", "Yes"],
            ["First Name", "String", "Text (50)", "Yes"],
            ["Last Name", "String", "Text (50)", "Yes"],
            ["SSN", "String", "NNN-NN-NNNN", "Yes"],
            ["Date of Birth", "Date", "YYYY-MM-DD", "Yes"],
            ["Plan Code", "String", "Plan identifier", "Yes"],
            ["Coverage Tier", "Enum", "See Appendix A", "Yes"],
            ["Effective Date", "Date", "YYYY-MM-DD", "Yes"],
            ["Termination Date", "Date / Null", "YYYY-MM-DD or blank", "Conditional"],
        ],
        widths=[140, 70, 150, 108]
    )

    d.h2("4. Dependent Data Fields")
    d.table(
        ["Field Name", "Type", "Required"],
        [
            ["Dependent First Name", "String", "Yes"],
            ["Dependent Last Name", "String", "Yes"],
            ["Dependent SSN", "String", "Yes"],
            ["Dependent Date of Birth", "Date", "Yes"],
            ["Relationship", "Enum: Spouse / Child / DP", "Yes"],
            ["Dependent Effective Date", "Date", "Yes"],
            ["Dependent Termination Date", "Date / Null", "Conditional"],
        ],
        widths=[200, 180, 88]
    )

    d.h2("5. Transaction Types")
    d.table(
        ["Transaction Type", "When to Send", "Required Fields"],
        [
            ["ADD", "New enrollment or new dependent", "All required fields"],
            ["CHANGE", "Tier change, plan change, address change", "Changed fields + EE ID"],
            ["TERMINATE", "End of coverage", "EE ID + termination date"],
            ["REINSTATE", "Return from leave / COBRA", "EE ID + new effective date"],
        ],
        widths=[110, 200, 158]
    )

    d.h2("6. Error Handling and Rejection Rules")
    d.p("Carriers may reject transactions for the following reasons:")
    d.li("Invalid or duplicate SSN")
    d.li("Invalid dependent ID or unrecognized dependent relationship")
    d.li("Coverage effective date in the past (beyond 30-day backdating limit)")
    d.li("Missing required fields")
    d.li("Plan code not recognized by carrier")
    d.li("Member ID already exists with conflicting data")
    d.blank(1)
    d.p("On rejection, the integration layer must:")
    d.li("Record the rejection with error code and message")
    d.li("Flag the transaction for manual review")
    d.li("Notify the benefits administrator within 24 hours")
    d.li("NOT auto-retry without human review for SSN or dependent ID errors")

    d.h2("7. Transmission Schedule")
    d.p("Medical and Disability carriers receive daily transactions by 11:00 PM ET.")
    d.p("Dental, Vision, and Life carriers receive weekly batch files on Friday at 11:00 PM ET.")
    d.p("HSA and FSA carriers receive monthly files on the 1st business day of each month.")
    d.blank(1)
    d.p("Payroll integration: Deduction changes must reach the payroll system no later than "
        "5:00 PM ET two business days before the next payroll cycle.")

    d.h2("8. Demo Rejection Scenario")
    d.p("Transaction CT-10045: John Smith dependent enrollment rejected by Medical carrier.")
    d.p("Error Code: DEP-INVALID-ID")
    d.p("Error Message: Dependent ID DEP-003 not found in carrier member records.")
    d.p("Required Action: Verify dependent SSN and re-submit. If problem persists, contact "
        "carrier EDI team for manual member ID assignment.")
    d.blank(1)
    d.p("(AI DEMO: This rejection scenario supports the exception resolution feature. AI should "
        "identify root cause, suggest corrective action, and generate a carrier support ticket.)")

    d.save(OUT_DIR / "Acme_Carrier_Requirements.pdf")


# ════════════════════════════════════════════════════════════════════════════════
# DOCUMENT 4 — Payroll Interface Spec
# ════════════════════════════════════════════════════════════════════════════════

def build_payroll_spec():
    d = Doc("Acme Payroll Interface Spec")

    d.h1("ACME CORPORATION")
    d.write("Payroll Interface Specification", 14, True)
    d.blank(1)
    d.p("Document ID: INT-PAY-2027  |  Version: 1.0  |  Effective: January 1, 2027")
    d.rule()

    d.h2("1. Overview")
    d.p("This specification defines the data exchange between the Acme Benefits platform and "
        "the ADP payroll system for benefit deduction management.")

    d.h2("2. Deduction Code Mapping")
    d.table(
        ["Benefit", "Deduction Code", "Tax Treatment", "Frequency"],
        [
            ["Medical PPO 500", "MED-PPO-500", "Pre-tax (Section 125)", "Per paycheck"],
            ["Medical HDHP 3000", "MED-HDHP-3000", "Pre-tax (Section 125)", "Per paycheck"],
            ["Dental Basic", "DEN-BASIC", "Pre-tax (Section 125)", "Per paycheck"],
            ["Dental Premium", "DEN-PREM", "Pre-tax (Section 125)", "Per paycheck"],
            ["Vision Standard", "VIS-STD", "Pre-tax (Section 125)", "Per paycheck"],
            ["Voluntary Life", "LIFE-VOL", "Post-tax", "Per paycheck"],
            ["STD Employee Share", "DIS-STD-EE", "Post-tax", "Per paycheck"],
            ["LTD Employee Share", "DIS-LTD-EE", "Post-tax", "Per paycheck"],
            ["HSA Contribution", "HSA-CONT", "Pre-tax", "Per paycheck"],
            ["FSA Contribution", "FSA-CONT", "Pre-tax", "Per paycheck"],
        ],
        widths=[145, 110, 120, 93]
    )

    d.h2("3. Pay Period Calculation")
    d.p("All monthly benefit costs are converted to per-paycheck amounts using the following divisors:")
    d.blank(1)
    d.table(
        ["Pay Frequency", "Annual Pay Periods", "Monthly Divisor", "Example ($150/month)"],
        [
            ["Weekly", "52", "4.333", "$34.62"],
            ["Biweekly", "26", "2.167", "$69.23"],
            ["Semi-Monthly", "24", "2.000", "$75.00"],
            ["Monthly", "12", "1.000", "$150.00"],
        ],
        widths=[120, 110, 110, 128]
    )
    d.blank(1)
    d.p("Acme Corporation uses Biweekly payroll. All benefit deductions are calculated using "
        "the Biweekly divisor of 2.167.")

    d.h2("4. Deduction Reconciliation")
    d.p("A three-way reconciliation is performed monthly between:")
    d.li("Benefits system: configured employee contribution amounts")
    d.li("Payroll system: actual deduction amounts per employee per paycheck")
    d.li("Carrier: billed premium amounts")
    d.blank(1)
    d.p("Reconciliation matching key: Employee ID (primary) + Plan Code (secondary)")
    d.blank(1)
    d.p("Tolerance: Differences of $0.02 or less per paycheck are acceptable rounding errors.")
    d.p("Differences greater than $0.02 must be flagged for review.")
    d.blank(1)
    d.p("(AI DEMO - PAYROLL MISMATCH SCENARIO)")
    d.p("Employee: John Smith (EE-001)")
    d.p("Plan: Medical PPO 500 (MED-PPO-500), Employee Only tier")
    d.p("Expected deduction: $75.00 per paycheck (based on $150/month employee share)")
    d.p("Actual deduction: $200.00 per paycheck")
    d.p("Variance: $125.00 per paycheck -- EXCEEDS TOLERANCE")
    d.p("AI should identify: Payroll system may still be using prior year rate or wrong coverage tier.")

    d.h2("5. Required Payroll File Fields")
    d.table(
        ["Field", "Type", "Description"],
        [
            ["EmployeeID", "String", "EE-NNN format"],
            ["DeductionCode", "String", "Plan deduction code"],
            ["ExpectedAmount", "Decimal", "Benefits system configured amount"],
            ["ActualAmount", "Decimal", "Payroll system deduction amount"],
            ["PayFrequency", "Enum", "Biweekly / Semi-Monthly / Monthly"],
            ["EffectiveDate", "Date", "YYYY-MM-DD"],
            ["CoverageMonth", "String", "YYYY-MM"],
            ["ReconciliationStatus", "Enum", "Matched / Mismatch / Pending"],
        ],
        widths=[140, 80, 248]
    )

    d.h2("6. Error Scenarios")
    d.table(
        ["Error Code", "Description", "Action Required"],
        [
            ["PAY-MISMATCH", "Deduction amount does not match configured rate", "HR review within 2 days"],
            ["PAY-MISSING", "Employee enrolled but no deduction found in payroll", "Payroll team to add"],
            ["PAY-EXTRA", "Deduction found but employee is not enrolled", "Payroll team to remove"],
            ["PAY-TERM", "Deduction continues after termination date", "Immediate correction"],
        ],
        widths=[110, 200, 158]
    )

    d.save(OUT_DIR / "Acme_Payroll_Interface_Spec.pdf")


# ════════════════════════════════════════════════════════════════════════════════
# DOCUMENT 5 — Enrollment Process
# ════════════════════════════════════════════════════════════════════════════════

def build_enrollment_process():
    d = Doc("Acme Enrollment Process")

    d.h1("ACME CORPORATION")
    d.write("Benefits Enrollment Process Guide", 14, True)
    d.blank(1)
    d.p("Document ID: OPS-ENROLL-2027  |  Version: 3.0  |  Effective: January 1, 2027")
    d.rule()

    d.h2("1. Enrollment Types")
    d.table(
        ["Enrollment Type", "When", "Window", "Override Required"],
        [
            ["Open Enrollment", "Annual / Nov 1-30", "30 days", "No"],
            ["New Hire Enrollment", "Within 30 days of hire", "30 days", "No"],
            ["Life Event Enrollment", "Within 30 days of event", "30 days", "No"],
            ["Late Enrollment", "Outside any window", "N/A", "HR Director approval"],
            ["COBRA Continuation", "Within 60 days of qualifying event", "60 days", "No"],
        ],
        widths=[155, 110, 80, 123]
    )

    d.h2("2. Enrollment Workflow Steps")
    d.p("The standard 8-step enrollment process:")
    d.blank(1)
    d.li("Step 1: Eligibility Verification -- System confirms employee meets all eligibility rules")
    d.li("Step 2: Plan Selection -- Employee selects medical, dental, vision plans")
    d.li("Step 3: Coverage Tier Selection -- Employee selects tier (EE only, EE+Spouse, etc.)")
    d.li("Step 4: Dependent Addition -- Employee adds and verifies eligible dependents")
    d.li("Step 5: Life Insurance Selection -- Basic auto-enrolled; voluntary options presented")
    d.li("Step 6: Disability Coverage -- STD/LTD options with cost calculator")
    d.li("Step 7: Cost Review -- Employee reviews total monthly and per-paycheck costs")
    d.li("Step 8: Confirmation -- Employee confirms elections; system locks enrollment")

    d.h2("3. Default Coverage Rules")
    d.p("Employees who do not actively enroll during open enrollment or the new hire window "
        "will be automatically enrolled in the following default plans:")
    d.blank(1)
    d.table(
        ["Benefit Type", "Default Plan", "Default Tier"],
        [
            ["Medical", "PPO 500 (MED-PPO-500)", "Employee Only"],
            ["Dental", "Dental Basic (DEN-BASIC)", "Employee Only"],
            ["Vision", "Vision Standard (VIS-STD)", "Employee Only"],
            ["Basic Life", "LIFE-BASIC (1x salary)", "Automatic"],
            ["Voluntary Life", "Not enrolled", "N/A"],
            ["STD/LTD", "Employer-paid portion only", "N/A"],
        ],
        widths=[140, 190, 138]
    )
    d.blank(1)
    d.p("(AI DEMO: Default plan is now explicitly defined. AI should link this to the ambiguous "
        "statements in Benefits Guide Section 9 and Eligibility Policy Section 7.)")

    d.h2("4. Status Lifecycle")
    d.table(
        ["Status", "Meaning", "Next State"],
        [
            ["Pending", "Employee has started but not submitted elections", "Submitted"],
            ["Submitted", "Elections submitted, awaiting HR review", "Approved / Rejected"],
            ["Approved", "HR has approved enrollment, carrier files pending", "Active"],
            ["Active", "Coverage is in force, deductions running", "Terminated / Changed"],
            ["Rejected", "HR rejected due to missing docs or eligibility issue", "Pending"],
            ["Terminated", "Coverage ended due to termination or voluntary waiver", "N/A"],
            ["Waived", "Employee actively waived coverage", "Open Enrollment eligible"],
        ],
        widths=[90, 200, 178]
    )

    d.h2("5. Life Event Processing")
    d.p("When an employee experiences a qualifying life event:")
    d.li("Employee submits life event notification in the Benefits Portal")
    d.li("System opens a 30-day enrollment window from the event date")
    d.li("Employee submits supporting documentation within the window")
    d.li("HR reviews and approves documentation")
    d.li("Enrollment changes are processed and sent to carriers")
    d.li("Payroll deductions are updated before the next payroll cycle")
    d.blank(1)
    d.p("AI Validation: The AI assistant will review the submitted life event details, "
        "verify documentation requirements, and confirm eligibility for the requested changes.")

    d.h2("6. Carrier File Generation")
    d.p("Upon approval of enrollment or life event changes:")
    d.li("Benefits platform generates carrier transaction file")
    d.li("Transaction includes all required fields per carrier specification")
    d.li("File is transmitted according to carrier schedule")
    d.li("Carrier acknowledgment is received and logged")
    d.li("Rejected transactions are flagged for manual review")
    d.blank(1)
    d.p("Integration Reference: See Acme_Carrier_Requirements.pdf for complete field specifications.")

    d.h2("7. Audit Requirements")
    d.p("All enrollment actions must be logged with the following information:")
    d.li("Timestamp of action")
    d.li("User or system that performed the action")
    d.li("Previous values and new values (for changes)")
    d.li("Reason for change (for life events and administrative overrides)")
    d.blank(1)
    d.p("Audit logs must be retained for a minimum of 7 years per ERISA requirements.")

    d.save(OUT_DIR / "Acme_Enrollment_Process.pdf")


# ════════════════════════════════════════════════════════════════════════════════
# Main
# ════════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("Generating Acme Corp 2027 Benefits sample PDFs...")
    build_benefits_guide()
    build_eligibility_policy()
    build_carrier_requirements()
    build_payroll_spec()
    build_enrollment_process()
    print("Done. Files written to:", OUT_DIR)
