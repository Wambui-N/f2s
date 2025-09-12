"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function WaitingListHero() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Sign up user with Supabase (no email confirmation required)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: 'temp_password_' + Math.random().toString(36).substr(2, 9), // Temporary password
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        }
      });

      if (signUpError) {
        // If user already exists, that's fine - they're already on the waitlist
        if (signUpError.message.includes('already registered')) {
          setIsSubmitted(true);
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-[#FCE8E1] to-[#F9C79B] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-[#F9C79B] to-[#FCE8E1] rounded-full opacity-15 blur-2xl"></div>
      
      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-dotted border-[#E5D5C8] overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            
            {/* Left Panel - CTA Section */}
            <div className="lg:w-2/5 bg-gradient-to-b from-[#FCE8E1] to-[#F9C79B] p-12 flex flex-col justify-center relative">
              {/* Subtle glow effect */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9C79B] to-transparent opacity-30"></div>
              
              <div className="relative z-10">
                <h1 className="text-4xl lg:text-5xl font-bold text-[#4A3B30] leading-tight mb-4">
                  Join
                  <br />
                  Waitlist
                </h1>
                
                <p className="text-[#4A3B30] text-sm mb-6 font-medium">
                  No payment required*
                </p>

                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/80 border-[#D4C4B0] text-[#4A3B30] placeholder:text-[#8B7355] focus:border-[#4A3B30] focus:ring-[#4A3B30] rounded-xl"
                        required
                      />
                    </div>
                    {error && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-white text-[#4A3B30] hover:bg-[#F8F6F3] border border-[#D4C4B0] rounded-xl font-medium py-3 shadow-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Joining...' : 'Join Waitlist'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#4A3B30] mb-2">
                      You're on the list!
                    </h3>
                    <p className="text-[#4A3B30] text-sm">
                      We'll notify you when FormToSheets is ready.
                    </p>
                  </div>
                )}

                <p className="text-[#4A3B30] text-sm mt-8 leading-relaxed">
                From amateur forms to professional conversions, we make you look like the market leader.
                </p>
              </div>
            </div>

            {/* Right Panel - Explanation Section */}
            <div className="lg:w-3/5 bg-[#FDFBF7] p-8 lg:p-10 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-8 w-8 text-[#4A3B30]" />
                  <span className="text-2xl font-bold text-[#4A3B30]">FormToSheets</span>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[#4A3B30] text-lg font-medium leading-relaxed">
                  While your competitors lose leads, you could be closing deals.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-[#4A3B30] text-base font-medium">
                      With FormToSheets you get:
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[#4A3B30] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-[#4A3B30] text-sm leading-relaxed">
                          <span className="font-medium">Seamless Google Sheets sync</span> → your spreadsheet becomes your CRM.
                        </p>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[#4A3B30] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-[#4A3B30] text-sm leading-relaxed">
                          <span className="font-medium">Beautiful, mobile-friendly forms</span> → designed to impress and convert.
                        </p>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[#4A3B30] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-[#4A3B30] text-sm leading-relaxed">
                          <span className="font-medium">Smart automation</span> → save hours on manual data entry.
                        </p>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-[#4A3B30] rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-[#4A3B30] text-sm leading-relaxed">
                          <span className="font-medium">Easy setup, zero code</span> → if you can copy-paste, you can use it.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-[#4A3B30] text-base font-medium mb-2">
                      Why join today?
                    </p>
                    <p className="text-[#4A3B30] text-sm leading-relaxed">
                      Early access means you'll be the first to test-drive features, shape the roadmap, and lock in lifetime perks before anyone else.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-right">
                    <p className="text-[#4A3B30] font-medium text-sm">
                      <span className="text-[#4A3B30] font-medium">FormToSheets</span>
                    </p>
                    <p className="text-[#4A3B30] text-sm mt-1">
                      {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
