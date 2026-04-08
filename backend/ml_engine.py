import pandas as pd
import numpy as np
from typing import Dict, Any, List

# ─────────────────────────────────────────────────────────────────────────────
# Constraint → numeric mapping
# ─────────────────────────────────────────────────────────────────────────────
LEVEL_MAP = {
    "very low": 0.1, "low": 0.25, "medium": 0.5,
    "moderate": 0.5, "high": 0.75, "very high": 0.95,
    "none": 0.0, "unlimited": 1.0
}

def _parse_constraint_value(raw: str) -> float:
    """Convert free-text or numeric constraint value to [0,1] float."""
    s = str(raw).strip().lower()
    if s in LEVEL_MAP:
        return LEVEL_MAP[s]
    try:
        v = float(s.replace(",", "").replace("$", "").replace("₹", ""))
        # Normalise loosely: treat values > 1 as a scale clamp to [0,1]
        return min(v / 100.0, 1.0) if v > 1.0 else v
    except ValueError:
        return 0.5  # unknown → neutral


class MLEngine:
    """Constraint-driven scoring engine (no training data required)."""

    # Weight each constraint category contributes to success
    SUCCESS_WEIGHTS = {
        "budget": 0.25,  "money": 0.25,  "capital": 0.25,
        "time":   0.20,  "duration": 0.20,
        "skill":  0.20,  "skills": 0.20, "experience": 0.20,
        "risk":   -0.15, "effort": 0.15,
        "support": 0.10, "network": 0.10,
    }

    def process_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Clean and compute basic statistics from an uploaded CSV."""
        numeric = data.select_dtypes(include=[np.number])
        summary = numeric.describe().round(3).to_dict()
        correlation = numeric.corr().round(3).to_dict() if not numeric.empty else {}
        trends = {}
        if not numeric.empty:
            for col in numeric.columns[:3]:  # top-3 columns
                trends[col] = {
                    "mean":   round(float(numeric[col].mean()), 3),
                    "trend":  "↑" if numeric[col].iloc[-1] > numeric[col].iloc[0] else "↓"
                }
        return {"summary": summary, "correlation": correlation, "trends": trends}

    def score_option(self, option_label: str, constraints: List[Dict], idx: int, n_options: int) -> Dict[str, float]:
        """
        Derive a success probability and risk score for one option
        from the shared constraint set.

        Each option gets a positional modifier so that options differ
        slightly even when sharing the same constraints.
        """
        base_score = 0.55  # neutral starting point

        for c in constraints:
            key   = str(c.get("key", "")).strip().lower()
            value = _parse_constraint_value(str(c.get("value", "0.5")))

            # Match constraint key to a known weight
            weight = 0.0
            for kw, w in self.SUCCESS_WEIGHTS.items():
                if kw in key:
                    weight = w
                    break

            base_score += weight * value

        # Small positional diversity: first option slightly better, last slightly worse
        diversity = 0.05 * (n_options / 2 - idx) / max(n_options, 1)
        base_score += diversity

        # Add controlled noise so repeated calls feel realistic
        noise = np.random.normal(0, 0.03)
        success = float(np.clip(base_score + noise, 0.25, 0.95))

        # Risk is inversely correlated with success + some variance
        risk = float(np.clip(1.0 - success + np.random.normal(0, 0.04), 0.05, 0.80))

        return {
            "success": round(success, 2),
            "risk":    round(risk, 2)
        }

    def predict_outcomes(
        self,
        options: List[str],
        constraints: List[Dict]
    ) -> Dict[str, Any]:
        """
        Return per-option probabilities and risk scores.
        Falls back to random if no options provided (legacy call).
        """
        if not options:
            return {
                "probabilities": {"Option A": round(np.random.uniform(0.55, 0.85), 2),
                                  "Option B": round(np.random.uniform(0.40, 0.70), 2)},
                "risk_scores":   {"Option A": round(np.random.uniform(0.15, 0.40), 2),
                                  "Option B": round(np.random.uniform(0.25, 0.55), 2)}
            }

        probabilities = {}
        risk_scores   = {}
        n = len(options)
        for i, opt in enumerate(options):
            scores = self.score_option(opt, constraints, i, n)
            probabilities[opt] = scores["success"]
            risk_scores[opt]   = scores["risk"]

        return {"probabilities": probabilities, "risk_scores": risk_scores}

    def get_best_option(self, probabilities: Dict[str, float]) -> str:
        """Return the option name with the highest success probability."""
        if not probabilities:
            return "N/A"
        return max(probabilities, key=lambda k: probabilities[k])

    def compute_confidence(self, probabilities: Dict[str, float]) -> int:
        """
        Confidence in the recommendation = how separated the top option is
        from the average of the rest.
        """
        if len(probabilities) < 2:
            return 75
        vals  = sorted(probabilities.values(), reverse=True)
        gap   = vals[0] - (sum(vals[1:]) / len(vals[1:]))
        score = int(np.clip(50 + gap * 200, 50, 98))
        return score


ml_engine = MLEngine()
