"use client";

import React from "react";
import { FileText, Mail, Twitter, Github } from "lucide-react";

export function WaitingListFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">ShelfCue</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Transform any form submission into organized Google Sheets
              automatically. No coding required. No complex setup. Just pure
              simplicity.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:hello@shelfcue.com"
                className="text-gray-400 hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/shelfcue"
                className="text-gray-400 hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/shelfcue"
                className="text-gray-400 hover:text-white"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#templates" className="text-gray-400 hover:text-white">
                  Templates
                </a>
              </li>
              <li>
                <a
                  href="#integrations"
                  className="text-gray-400 hover:text-white"
                >
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-400 hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-400 hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 FormToSheets. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#privacy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-400 hover:text-white text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-gray-400 hover:text-white text-sm"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
