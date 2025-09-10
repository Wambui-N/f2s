"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from './types';
import { 
  CheckCircle, 
  XCircle, 
  Copy, 
  ExternalLink, 
  Play, 
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';

interface PublishFlowProps {
  formData: FormData;
  onClose: () => void;
}

interface TestResult {
  success: boolean;
  message: string;
  rowNumber?: number;
  error?: string;
}

export function PublishFlow({ formData, onClose }: PublishFlowProps) {
  const [step, setStep] = useState<'publish' | 'test' | 'embed'>('publish');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Simulate publishing
      await new Promise(resolve => setTimeout(resolve, 2000));
      const url = `https://formtosheets.com/form/${formData.id}`;
      setFormUrl(url);
      setStep('test');
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTestSubmit = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Simulate test submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful test
      setTestResult({
        success: true,
        message: 'Test submission successful!',
        rowNumber: 42
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test submission failed',
        error: 'Connection error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const generateEmbedCode = () => {
    const code = `<script src="https://formtosheets.com/embed.js" data-form-id="${formData.id}"></script>`;
    setEmbedCode(code);
    setStep('embed');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl">Publish Form</CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <XCircle size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Publish */}
          {step === 'publish' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Publish?</h3>
                <p className="text-muted-foreground">
                  Your form will be live and ready to collect submissions.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Form Title</Label>
                <Input value={formData.title} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label>Form Description</Label>
                <Textarea 
                  value={formData.description || 'No description provided'} 
                  readOnly 
                  rows={3}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Form will be accessible via a public URL</p>
                <p>• Submissions will be saved to your Google Sheet</p>
                <p>• Form is mobile-responsive and secure</p>
              </div>
              
              <Button 
                onClick={handlePublish} 
                disabled={isPublishing}
                className="w-full"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Form'
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Test Submit */}
          {step === 'test' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Test Your Form</h3>
                <p className="text-muted-foreground">
                  Submit a test entry to verify everything works correctly.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Form URL</Label>
                <div className="flex space-x-2">
                  <Input value={formUrl} readOnly />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(formUrl)}
                  >
                    <Copy size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(formUrl, '_blank')}
                  >
                    <ExternalLink size={16} />
                  </Button>
                </div>
              </div>
              
              {testResult && (
                <div className={`p-4 rounded-lg border ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {testResult.success ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </p>
                      {testResult.success && testResult.rowNumber && (
                        <p className="text-sm text-green-600">
                          Data saved to row #{testResult.rowNumber} in your Google Sheet
                        </p>
                      )}
                      {testResult.error && (
                        <p className="text-sm text-red-600">{testResult.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleTestSubmit} 
                  disabled={isTesting}
                  className="flex-1"
                >
                  {isTesting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" />
                      Test Submit
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateEmbedCode}
                  disabled={!testResult?.success}
                >
                  Get Embed Code
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Embed Code */}
          {step === 'embed' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Embed Your Form</h3>
                <p className="text-muted-foreground">
                  Copy the code below to embed your form on any website.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Embed Code</Label>
                <div className="flex space-x-2">
                  <Textarea 
                    value={embedCode} 
                    readOnly 
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(embedCode)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Direct Link</Label>
                <div className="flex space-x-2">
                  <Input value={formUrl} readOnly />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(formUrl)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Add the embed code to your website</li>
                  <li>• Share the direct link on social media</li>
                  <li>• Monitor submissions in your Google Sheet</li>
                  <li>• Customize the form further if needed</li>
                </ul>
              </div>
              
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
