// src/assets/components/PT/PTMealPlanAssignment.jsx
import React, { useState } from "react";
import "./PTMealPlanAssignment.css";

const SAMPLE_MEAL_PLANS = [
  {
    id: "mp1",
    name: "High Protein Cut (2000 cal)",
    calories: 2000,
    protein: 180,
    carbs: 150,
    fats: 65,
    meals: 4,
  },
  {
    id: "mp2",
    name: "Muscle Gain (2800 cal)",
    calories: 2800,
    protein: 200,
    carbs: 320,
    fats: 85,
    meals: 5,
  },
  {
    id: "mp3",
    name: "Balanced Maintenance (2200 cal)",
    calories: 2200,
    protein: 165,
    carbs: 220,
    fats: 75,
    meals: 4,
  },
  {
    id: "mp4",
    name: "Low Carb / Keto (1800 cal)",
    calories: 1800,
    protein: 140,
    carbs: 50,
    fats: 120,
    meals: 3,
  },
];

export default function PTMealPlanAssignment({ clientId, clientName, onAssign }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customNotes, setCustomNotes] = useState("");

  const assignPlan = () => {
    if (!selectedPlan) {
      alert("Please select a meal plan first");
      return;
    }

    const assignment = {
      clientId,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      notes: customNotes,
      assignedAt: new Date().toISOString(),
    };

    // Call parent callback
    onAssign?.(assignment);

    // Show confirmation
    alert(`Meal plan "${selectedPlan.name}" assigned to ${clientName}!`);
    
    // Reset form
    setSelectedPlan(null);
    setCustomNotes("");
  };

  return (
    <div className="pt-meal-assignment">
      <div className="pt-meal-header">
        <div className="pt-meal-title">📋 Assign Meal Plan to {clientName}</div>
        <div className="pt-meal-subtitle">Select a template or create custom</div>
      </div>

      <div className="pt-meal-plans-scroll">
        {SAMPLE_MEAL_PLANS.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          return (
            <button
              key={plan.id}
              className={`pt-meal-plan-card ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedPlan(plan)}
              type="button"
            >
              <div className="pt-meal-plan-name">{plan.name}</div>
              <div className="pt-meal-plan-macros">
                <div className="macro-item">
                  <span className="macro-label">Calories</span>
                  <span className="macro-value">{plan.calories}</span>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Protein</span>
                  <span className="macro-value">{plan.protein}g</span>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Carbs</span>
                  <span className="macro-value">{plan.carbs}g</span>
                </div>
                <div className="macro-item">
                  <span className="macro-label">Fats</span>
                  <span className="macro-value">{plan.fats}g</span>
                </div>
              </div>
              <div className="pt-meal-plan-meals">{plan.meals} meals/day</div>
            </button>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="pt-meal-custom-notes">
          <label className="pt-meal-label">
            Custom Notes for {clientName}
            <textarea
              className="pt-meal-textarea"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Example: Focus on lean proteins. Add veggies to every meal. Drink 1 gallon water daily."
              rows={4}
            />
          </label>
        </div>
      )}

      <div className="pt-meal-actions">
        <button
          className="pt-meal-btn-assign"
          onClick={assignPlan}
          disabled={!selectedPlan}
        >
          Assign Plan to {clientName} →
        </button>
        <button
          className="pt-meal-btn-custom"
          onClick={() => alert("Custom meal plan builder coming soon!")}
          type="button"
        >
          Create Custom Plan
        </button>
      </div>
    </div>
  );
}
