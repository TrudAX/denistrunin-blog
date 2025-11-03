import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Presentation = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Title
    {
      title: "External Integration Framework",
      subtitle: "Standardized approach for X++ based integrations",
      content: (
        <div className="space-y-8">
          <div className="bg-blue-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Framework Steps</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg mb-2">1. Design</div>
                <p className="text-gray-700">Structured approach to integration planning</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg mb-2">2. Template</div>
                <p className="text-gray-700">Pre-built requirements templates</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg mb-2">3. Samples</div>
                <p className="text-gray-700">Sales lines, Ledger journals, Purchase lines, Vendors</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg mb-2">4. Testing</div>
                <p className="text-gray-700">Built-in performance testing tools</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 2: Integration Types, Formats & Channels
    {
      title: "Supported Integration Capabilities",
      content: (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Integration Types</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Inbound</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Outbound Event-based</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Outbound Periodic</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Service-based</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-green-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Data Formats</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>CSV</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>EDI</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Excel</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>XML</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>JSON</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Channels</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Service Bus</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>SFTP</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Azure File Share</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Web Service REST API</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>AI (LLM)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">▸</span>
                <span>Manual</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    
    // Slide 3: Advantages
    {
      title: "Advantages Over Standard Microsoft Tools",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">External Integration Framework Benefits</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="border-l-4 border-blue-600 pl-6 bg-gray-50 p-6">
              <h4 className="text-xl font-bold text-blue-900 mb-2">vs. DMF (Data Management Framework)</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Reusable processing logic across multiple scenarios</li>
                <li>• Built-in staging validation and error handling</li>
                <li>• Simplified mapping with custom transformation logic</li>
                <li>• Native X++ code - no external dependencies</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-600 pl-6 bg-gray-50 p-6">
              <h4 className="text-xl font-bold text-green-900 mb-2">vs. Business Events</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Comprehensive outbound integration management</li>
                <li>• Flexible event-based and periodic processing</li>
                <li>• Advanced filtering and transformation capabilities</li>
                <li>• Centralized configuration and monitoring</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-purple-600 pl-6 bg-gray-50 p-6">
              <h4 className="text-xl font-bold text-purple-900 mb-2">vs. Message Processor</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Unified integration patterns across all scenarios</li>
                <li>• Better traceability with staging tables</li>
                <li>• Built-in performance testing tools</li>
                <li>• Extensible framework for custom requirements</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 4: AI PDF Import - Overview
    {
      title: "AI-Powered PDF Import",
      subtitle: "Importing Purchase Orders from complex PDF invoices",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg">
            <h3 className="text-2xl font-bold">Challenge</h3>
            <p className="mt-2 text-lg">Vendors send complex invoice documents as PDFs. Traditional OCR tools produce inconsistent results with formatting errors, merged cells, and missing data.</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-green-900 mb-4">Solution: AI-Based Extraction</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <div className="text-green-600 font-bold mb-2">✓ Intelligent Parsing</div>
                <p className="text-sm text-gray-700">Uses Google Gemini 2.5 Flash to understand document structure and extract data accurately</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-green-600 font-bold mb-2">✓ JSON Output</div>
                <p className="text-sm text-gray-700">Structured data ready for External Integration Framework processing</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-green-600 font-bold mb-2">✓ Fast Processing</div>
                <p className="text-sm text-gray-700">~2 minutes for 200-line invoice (4-5 pages)</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <div className="text-green-600 font-bold mb-2">✓ Cost Effective</div>
                <p className="text-sm text-gray-700">Fraction of a cent per page</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 5: AI Setup
    {
      title: "AI Integration Setup",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Three-Step Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white border-l-4 border-blue-600 p-6 shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">1</div>
                <h4 className="text-lg font-bold">AI Provider Configuration</h4>
              </div>
              <ul className="ml-14 space-y-2 text-gray-700">
                <li>• Create class extending DEVIntegAIProviderBase</li>
                <li>• Configure Google Gemini endpoint</li>
                <li>• Set up API key from aistudio.google.com</li>
              </ul>
            </div>
            
            <div className="bg-white border-l-4 border-green-600 p-6 shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">2</div>
                <h4 className="text-lg font-bold">Prompt Definition</h4>
              </div>
              <ul className="ml-14 space-y-2 text-gray-700">
                <li>• Define extraction rules for HEADER and LINES</li>
                <li>• Specify field mappings and transformations</li>
                <li>• Test and validate on sample invoices</li>
              </ul>
            </div>
            
            <div className="bg-white border-l-4 border-purple-600 p-6 shadow-md">
              <div className="flex items-center mb-3">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">3</div>
                <h4 className="text-lg font-bold">Processing Class Setup</h4>
              </div>
              <ul className="ml-14 space-y-2 text-gray-700">
                <li>• Create DEVIntegTutorialPurchOrderOCRProcess class</li>
                <li>• Configure staging and validation rules</li>
                <li>• Define custom parameters (tax groups, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 6: AI Processing Workflow
    {
      title: "AI Processing Workflow",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 p-6 rounded-lg flex-1 mr-3">
              <div className="text-center">
                <div className="text-4xl mb-2">📄</div>
                <div className="font-bold text-blue-900">Upload PDF</div>
                <div className="text-sm text-gray-600 mt-2">Vendor invoice document</div>
              </div>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="bg-purple-100 p-6 rounded-lg flex-1 mx-3">
              <div className="text-center">
                <div className="text-4xl mb-2">🤖</div>
                <div className="font-bold text-purple-900">AI Analysis</div>
                <div className="text-sm text-gray-600 mt-2">Gemini extracts structured data</div>
              </div>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="bg-green-100 p-6 rounded-lg flex-1 mx-3">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="font-bold text-green-900">Staging</div>
                <div className="text-sm text-gray-600 mt-2">Validation & review</div>
              </div>
            </div>
            <div className="text-3xl text-gray-400">→</div>
            <div className="bg-orange-100 p-6 rounded-lg flex-1 ml-3">
              <div className="text-center">
                <div className="text-4xl mb-2">✓</div>
                <div className="font-bold text-orange-900">PO Created</div>
                <div className="text-sm text-gray-600 mt-2">In D365FO</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6">
            <h4 className="font-bold text-yellow-900 mb-3">Three-Level Validation</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded">
                <div className="font-bold text-yellow-900 mb-2">1. Header Validation</div>
                <p className="text-gray-700">Total amount and quantity verification</p>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="font-bold text-yellow-900 mb-2">2. Line Validation</div>
                <p className="text-gray-700">Item IDs, prices, and quantities</p>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="font-bold text-yellow-900 mb-2">3. Standard Validation</div>
                <p className="text-gray-700">D365FO business rules</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 7: Key Features
    {
      title: "AI Import Key Features",
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Intelligent Mapping</h3>
              <ul className="space-y-2 text-sm">
                <li>• AI handles complex mappings (e.g., "37' TV" → "T0004")</li>
                <li>• Color grouping based on document structure</li>
                <li>• Context-aware field extraction</li>
                <li>• Handles multi-page documents seamlessly</li>
              </ul>
            </div>
            
            <div className="bg-green-600 text-white p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Staging Tables</h3>
              <ul className="space-y-2 text-sm">
                <li>• Full traceability to original PDF</li>
                <li>• Manual correction capabilities</li>
                <li>• Validation before PO creation</li>
                <li>• Audit trail for compliance</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-600 text-white p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Flexibility</h3>
              <ul className="space-y-2 text-sm">
                <li>• Customizable prompts per scenario</li>
                <li>• Support for various document layouts</li>
                <li>• Configurable validation rules</li>
                <li>• Tax calculation options</li>
              </ul>
            </div>
            
            <div className="bg-orange-600 text-white p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Pure X++ Implementation</h3>
              <ul className="space-y-2 text-sm">
                <li>• No external DLLs required</li>
                <li>• Works on local VHD environments</li>
                <li>• Easy to maintain and extend</li>
                <li>• Open source on GitHub</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    
    // Slide 8: Questions
    {
      title: "Questions?",
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="text-6xl">💬</div>
          <div className="text-center space-y-4">
            <p className="text-2xl font-bold text-gray-800">Thank you for your attention!</p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-gray-700 mb-4">Resources:</p>
              <div className="space-y-2 text-left">
                <div>📚 Blog: <span className="text-blue-600 font-mono">denistrunin.com/tags/integration/</span></div>
                <div>💻 GitHub: <span className="text-blue-600 font-mono">github.com/TrudAX/XppTools</span></div>
                <div>🎓 Tutorial: <span className="text-blue-600 font-mono">DEVExternalIntegrationSamples</span></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Slide Container */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden" style={{ height: '600px' }}>
          {/* Slide Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <h1 className="text-4xl font-bold">{currentSlideData.title}</h1>
            {currentSlideData.subtitle && (
              <p className="text-xl mt-2 text-blue-100">{currentSlideData.subtitle}</p>
            )}
          </div>
          
          {/* Slide Content */}
          <div className="p-8 overflow-y-auto" style={{ height: 'calc(600px - 180px)' }}>
            {currentSlideData.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentSlide === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <ChevronLeft className="mr-2" size={20} />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
              currentSlide === slides.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
            <ChevronRight className="ml-2" size={20} />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4 text-gray-600">
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>
    </div>
  );
};

export default Presentation;