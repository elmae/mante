"use client";

import { useState } from "react";
import { RetentionRuleForm } from "@/components/settings/RetentionRuleForm";
import { RetentionRulesList } from "@/components/settings/RetentionRulesList";
import {
  RetentionRule,
  NewRetentionRule,
  DEFAULT_RETENTION_RULES,
} from "@/types/retention";

export default function RetentionSettingsPage() {
  const [rules, setRules] = useState<RetentionRule[]>(
    DEFAULT_RETENTION_RULES.map((rule, index) => ({
      ...rule,
      id: `rule-${index + 1}`,
    }))
  );
  const [editingRule, setEditingRule] = useState<RetentionRule | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSaveRule = (rule: NewRetentionRule) => {
    if (editingRule) {
      // Actualizar regla existente
      setRules(
        rules.map((r) => (r.id === editingRule.id ? { ...rule, id: r.id } : r))
      );
    } else {
      // Crear nueva regla
      setRules([...rules, { ...rule, id: `rule-${rules.length + 1}` }]);
    }
    setEditingRule(null);
    setShowForm(false);
  };

  const handleEditRule = (rule: RetentionRule) => {
    setEditingRule(rule);
    setShowForm(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Configuración de Retención
            </h1>
            <p className="text-gray-600">
              Configura las reglas de retención para diferentes tipos de
              archivos
            </p>
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setShowForm(true);
            }}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Nueva Regla
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {editingRule ? "Editar Regla" : "Nueva Regla"}
            </h2>
            <button
              onClick={() => {
                setEditingRule(null);
                setShowForm(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
          <RetentionRuleForm
            onSubmit={handleSaveRule}
            initialValues={editingRule || undefined}
          />
        </div>
      ) : (
        <div className="mb-8">
          <RetentionRulesList
            rules={rules}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
          />
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Acerca de la Retención
        </h3>
        <div className="mt-2 text-sm text-gray-600">
          <p>
            Las reglas de retención determinan cuánto tiempo se mantienen los
            archivos antes de moverse a la papelera de reciclaje. Una vez en la
            papelera, los archivos permanecen por 30 días adicionales antes de
            eliminarse permanentemente.
          </p>
          <p className="mt-2">
            Las reglas se aplican en orden, y la primera regla que coincida con
            un archivo será la que determine su período de retención.
          </p>
        </div>
      </div>
    </div>
  );
}
