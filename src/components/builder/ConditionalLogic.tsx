"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from './types';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

export interface ConditionalRule {
  id: string;
  conditionField: string;
  operator: 'equals' | 'contains' | 'not_empty' | 'empty';
  value: string;
  action: 'show' | 'hide';
  targetField: string;
  enabled: boolean;
}

interface ConditionalLogicProps {
  fields: FormField[];
  rules: ConditionalRule[];
  onUpdateRules: (rules: ConditionalRule[]) => void;
}

export function ConditionalLogic({ fields, rules, onUpdateRules }: ConditionalLogicProps) {
  const [editingRule, setEditingRule] = useState<ConditionalRule | null>(null);

  const addRule = () => {
    const newRule: ConditionalRule = {
      id: `rule_${Date.now()}`,
      conditionField: fields[0]?.id || '',
      operator: 'equals',
      value: '',
      action: 'show',
      targetField: fields[1]?.id || '',
      enabled: true
    };
    onUpdateRules([...rules, newRule]);
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    const updatedRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    onUpdateRules(updatedRules);
  };

  const deleteRule = (ruleId: string) => {
    onUpdateRules(rules.filter(rule => rule.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    updateRule(ruleId, { enabled: !rules.find(r => r.id === ruleId)?.enabled });
  };

  const getFieldLabel = (fieldId: string) => {
    return fields.find(f => f.id === fieldId)?.label || 'Unknown Field';
  };

  const getOperatorLabel = (operator: string) => {
    const labels = {
      equals: 'equals',
      contains: 'contains',
      not_empty: 'is not empty',
      empty: 'is empty'
    };
    return labels[operator as keyof typeof labels] || operator;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conditional Logic</CardTitle>
          <Button onClick={addRule} size="sm">
            <Plus size={16} className="mr-1" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No conditional logic rules yet.</p>
              <p className="text-sm">Add rules to show/hide fields based on user responses.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id} className={`p-4 ${!rule.enabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRule(rule.id)}
                      className="h-6 w-6 p-0"
                    >
                      {rule.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </Button>
                    <span className="text-sm font-medium">
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">If</span>
                    <Select
                      value={rule.conditionField}
                      onValueChange={(value) => updateRule(rule.id, { conditionField: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Select
                      value={rule.operator}
                      onValueChange={(value: any) => updateRule(rule.id, { operator: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="not_empty">is not empty</SelectItem>
                        <SelectItem value="empty">is empty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rule.operator !== 'not_empty' && rule.operator !== 'empty' && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Input
                        value={rule.value}
                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        placeholder="Enter value"
                        className="w-40"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">then</span>
                    <Select
                      value={rule.action}
                      onValueChange={(value: any) => updateRule(rule.id, { action: value })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show">show</SelectItem>
                        <SelectItem value="hide">hide</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={rule.targetField}
                      onValueChange={(value) => updateRule(rule.id, { targetField: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
