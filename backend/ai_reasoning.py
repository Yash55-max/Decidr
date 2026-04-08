import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# Gemini integration (falls back to rich rule-based logic if no key)
# ─────────────────────────────────────────────────────────────────────────────
_gemini_available = False
try:
    import google.generativeai as genai
    _api_key = os.getenv("GEMINI_API_KEY", "")
    if _api_key and _api_key != "your_gemini_api_key_here":
        genai.configure(api_key=_api_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        _gemini_available = True
except ImportError:
    pass


class AIReasoningEngine:
    """
    AI Logical Reasoning Layer.
    Uses Gemini Flash when available; falls back to enhanced rule-based logic.
    """

    def _build_prompt(
        self,
        title: str,
        options: List[str],
        constraints: List[Dict],
        probabilities: Dict[str, float],
        risk_scores: Dict[str, float],
        best_option: str,
        confidence: int
    ) -> str:
        opt_lines = "\n".join(
            f"  • {opt}: success={probabilities.get(opt, '?')}, risk={risk_scores.get(opt, '?')}"
            for opt in options
        )
        constraint_lines = ", ".join(
            f"{c.get('key','?')}={c.get('value','?')}"
            for c in constraints
        ) or "none specified"

        return f"""
You are an expert decision intelligence advisor. Analyze this decision and respond ONLY with valid JSON.

Decision: "{title}"
Options with ML scores:
{opt_lines}
User constraints: {constraint_lines}
Top recommendation: {best_option} (confidence: {confidence}%)

Respond with EXACTLY this JSON structure (no markdown fences):
{{
  "analysis": "<2–3 sentence data-driven analysis of the decision landscape>",
  "recommendation": "<1 crisp recommendation sentence starting with the best option name>",
  "bias_detection": "<1 sentence on any emotional or cognitive bias in the decision framing>",
  "trade_offs": "<1–2 sentences listing the key trade-offs between the options>",
  "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
}}
""".strip()

    def _call_gemini(self, prompt: str) -> Dict[str, str]:
        """Call Gemini Flash and parse the JSON response."""
        try:
            response = _gemini_model.generate_content(prompt)
            raw = response.text.strip()
            # Strip markdown fences if model adds them
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw)
        except Exception as e:
            return {"_error": str(e)}

    def _rule_based_reasoning(
        self,
        title: str,
        options: List[str],
        probabilities: Dict[str, float],
        risk_scores: Dict[str, float],
        best_option: str,
        confidence: int
    ) -> Dict[str, Any]:
        """Enhanced rule-based fallback when Gemini is unavailable."""
        best_prob = probabilities.get(best_option, 0.5)
        best_risk = risk_scores.get(best_option, 0.3)

        # Dynamic recommendation label
        if best_prob >= 0.80:
            rec_prefix = "✅ STRONGLY RECOMMENDED"
        elif best_prob >= 0.65:
            rec_prefix = "⚡ RECOMMENDED WITH CARE"
        elif best_prob >= 0.50:
            rec_prefix = "⚖️ NEUTRAL – PROCEED CAUTIOUSLY"
        else:
            rec_prefix = "⚠️ CONSIDER ALTERNATIVES"

        # Risk label
        if best_risk <= 0.20:
            risk_label = "low"
        elif best_risk <= 0.45:
            risk_label = "moderate"
        else:
            risk_label = "high"

        # Identify second-best for trade-off comparison
        sorted_opts = sorted(probabilities.items(), key=lambda x: x[1], reverse=True)
        runner_up   = sorted_opts[1][0] if len(sorted_opts) > 1 else "the alternative"

        analysis = (
            f"Analyzing '{title}' across {len(options)} option(s) with constraint-weighted ML scoring. "
            f"'{best_option}' achieves the highest success probability ({best_prob:.0%}) against "
            f"a {risk_label} risk profile ({best_risk:.0%}). "
            f"The model is {confidence}% confident based on constraint separation between the options."
        )

        recommendation = (
            f"{rec_prefix}: '{best_option}' leads with {best_prob:.0%} predicted success. "
            f"Validate your top constraints before committing."
        )

        bias_detection = (
            "Mild status-quo bias may be influencing option ordering. "
            "Ensure each option was evaluated objectively on its own merits."
        )

        trade_offs = (
            f"'{best_option}' offers higher success probability but may require more upfront commitment. "
            f"'{runner_up}' carries a different risk profile — consider it as a fallback or hedge strategy."
        )

        action_steps = [
            f"Deep-dive the constraints limiting '{best_option}' most severely.",
            f"Run a 30-day pilot or prototype for '{best_option}' before full commitment.",
            f"Define a clear exit criterion: if KPIs aren't met within 90 days, pivot to '{runner_up}'."
        ]

        return {
            "analysis":       analysis,
            "recommendation": recommendation,
            "bias_detection": bias_detection,
            "trade_offs":     trade_offs,
            "action_steps":   action_steps
        }

    def generate_reasoning(
        self,
        ml_results: Dict[str, Any],
        user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Main entry point called by main.py.
        ml_results: {"probabilities": {...}, "risk_scores": {...}, "best_option": "...", "confidence": int}
        user_context: {"title": "...", "options": [...], "constraints": [...]}
        """
        title       = user_context.get("title", "this decision")
        options     = user_context.get("options", list(ml_results.get("probabilities", {}).keys()))
        constraints = user_context.get("constraints", [])
        probs       = ml_results.get("probabilities", {})
        risks       = ml_results.get("risk_scores", {})
        best_option = ml_results.get("best_option", max(probs, key=probs.get) if probs else "N/A")
        confidence  = ml_results.get("confidence", 75)

        if _gemini_available:
            prompt = self._build_prompt(title, options, constraints, probs, risks, best_option, confidence)
            result = self._call_gemini(prompt)
            if "_error" not in result:
                # Ensure action_steps always present
                if "action_steps" not in result:
                    result["action_steps"] = [
                        f"Validate constraints for '{best_option}'.",
                        "Run a 30-day pilot before committing.",
                        "Set measurable success criteria now."
                    ]
                result["used_llm"] = True
                return result

        # Fallback
        result = self._rule_based_reasoning(title, options, probs, risks, best_option, confidence)
        result["used_llm"] = False
        return result


ai_reasoning_engine = AIReasoningEngine()
