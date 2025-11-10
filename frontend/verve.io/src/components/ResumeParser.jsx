// src/components/PDFTextReader.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  XCircle,
  Sparkles,
  BookOpen,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Layers,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

// ✅ Import Firebase setup
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PDFTextReader() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [sections, setSections] = useState([]);
  const [analysis, setAnalysis] = useState(null); // JSON from /api/resume/analyze
  const [activeTab, setActiveTab] = useState("extracted"); // "extracted" or "recommendations"
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
    };
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
      setSections([]);
      setAnalysis(null);
      setActiveTab("extracted");
      setUploadStatus("");
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  // Extract text from PDF
  const extractTextFromPDF = async (pdfFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            text += strings.join(" ") + "\n";
          }
          resolve(text);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsArrayBuffer(pdfFile);
    });
  };

  // 🧠 Intelligent Resume Parser + Formatter
  const formatResume = (text) => {
    const sectionTitles = [
      "Profile",
      "Technical Skills and Interests",
      "Projects",
      "Achievements",
      "Certifications",
      "Positions of Responsibility",
      "Education",
      "Experience",
    ];

    const sections = [];
    let current = { title: "Profile", content: "" };
    const lines = text
      .replace(/\s{2,}/g, " ")
      .split(
        /(?=\b(?:Profile|Technical Skills and Interests|Projects|Achievements|Certifications|Positions of Responsibility|Education|Experience)\b)/gi
      );

    for (let line of lines) {
      const titleMatch = sectionTitles.find((t) =>
        line.toLowerCase().includes(t.toLowerCase())
      );

      if (titleMatch) {
        if (current.content) sections.push(current);
        current = {
          title: titleMatch,
          content: line.replace(titleMatch, "").trim(),
        };
      } else {
        current.content += " " + line.trim();
      }
    }
    if (current.content) sections.push(current);

    return sections.map((s) => ({
      title: s.title,
      content: formatBullets(s.content),
    }));
  };

  // Clean bullet points and paragraphs
  const formatBullets = (text) => {
    return text
      .replace(/•/g, "\n•")
      .replace(/–/g, " – ")
      .replace(/\s{3,}/g, " ")
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
  };

  // ✅ Save extracted data to Firebase Firestore
  const saveToFirebase = async (resumeData) => {
    try {
      setUploadStatus("Saving to Firebase...");
      await addDoc(collection(db, "resumes"), {
        ...resumeData,
        timestamp: serverTimestamp(),
      });
      setUploadStatus("✅ Resume data saved to Firebase successfully!");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      setUploadStatus("❌ Failed to save to Firebase: " + error.message);
    }
  };

  // Handle Extraction, Analyze, and Upload
  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    setError("");
    setUploadStatus("");
    setActiveTab("extracted");

    try {
      const rawText = await extractTextFromPDF(file);
      const parsedSections = formatResume(rawText);
      setSections(parsedSections);

      const resumeData = {
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          sectionCount: parsedSections.length,
        },
        content: parsedSections,
        rawText: rawText.substring(0, 1000) + "...",
      };

      // Save to Firebase instead of server
      await saveToFirebase(resumeData);

      // Send extracted text to /api/resume/analyze
      const analyzeResp = await fetch("http://localhost:3000/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: rawText }),
      });
      const analyzeJson = await analyzeResp.json();
      if (analyzeJson && analyzeJson.success && analyzeJson.analysis) {
        setAnalysis(analyzeJson.analysis);
      } else {
        setAnalysis(null);
        setError("Failed to get recommendations from AI analysis.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to extract text or analyze. Please upload a valid text-based PDF.");
    } finally {
      setExtracting(false);
    }
  };

  // Section icons (unchanged)
  const iconForSection = (title) => {
    const map = {
      Profile: <BookOpen className="w-5 h-5 text-blue-600" />,
      Projects: <Code className="w-5 h-5 text-blue-600" />,
      Achievements: <Award className="w-5 h-5 text-blue-600" />,
      Education: <GraduationCap className="w-5 h-5 text-blue-600" />,
      Certifications: <Layers className="w-5 h-5 text-blue-600" />,
      "Technical Skills and Interests": (
        <Sparkles className="w-5 h-5 text-blue-600" />
      ),
      "Positions of Responsibility": (
        <Briefcase className="w-5 h-5 text-blue-600" />
      ),
    };
    return map[title] || <FileText className="w-5 h-5 text-blue-600" />;
  };

  return (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                AI Resume Parser 
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                Upload your resume for AI-powered analysis and personalized recommendations
              </p>
            </div>
            <a 
              href="/dashboard"
              className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm font-medium border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </a>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 sticky top-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> 
                Upload Resume PDF
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <FileText className="w-12 h-12 text-slate-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {file ? file.name : "Click to upload PDF"}
                </p>
                <p className="text-xs text-slate-500">Text-based PDF only</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleExtract}
                disabled={!file || extracting}
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" /> 
                    Extract & Analyze
                  </>
                )}
              </button>

              {uploadStatus && (
                <div
                  className={`mt-4 flex items-start gap-2 p-3 rounded-lg ${
                    uploadStatus.includes("Failed")
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-green-50 border border-green-200 text-green-700"
                  }`}
                >
                  {uploadStatus.includes("Failed") ? (
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{uploadStatus}</p>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Resume Display & Recommendations */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            {/* Tab Navigation */}
            {sections.length > 0 && (
              <div className="border-b border-slate-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("extracted")}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                      activeTab === "extracted"
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      Parsed Resume
                      {sections.length > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {sections.length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                      activeTab === "recommendations"
                        ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      AI Recommendations
                      {analysis ? (
                        <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          1
                        </span>
                      ) : null}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {extracting ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">
                    Extracting and analyzing your resume...
                  </p>
                </div>
              ) : activeTab === "extracted" && sections.length > 0 ? (
                <div className="space-y-8">
                  {sections.map((section, i) => (
                    <div key={i} className="border-b border-slate-200 pb-6 last:border-b-0">
                      <div className="flex items-center gap-3 mb-4">
                        {iconForSection(section.title)}
                        <h2 className="text-xl font-bold text-slate-800">
                          {section.title}
                        </h2>
                      </div>
                      <div className="space-y-2 text-slate-700 text-sm leading-relaxed">
                        {section.content.map((line, idx) =>
                          line.startsWith("•") ? (
                            <div
                              key={idx}
                              className="flex items-start gap-2 ml-4"
                            >
                              <span className="text-blue-600 mt-1.5">•</span>
                              <span>{line.replace("•", "").trim()}</span>
                            </div>
                          ) : (
                            <p key={idx} className="text-slate-600">{line}</p>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === "recommendations" && analysis ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-3 mx-auto">
                      <Lightbulb className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      AI Resume Recommendations
                    </h2>
                    <p className="text-slate-600 mt-2">
                      Tailored insights and actions powered by our AI engine.
                    </p>
                  </div>
                  <div className="grid gap-6">
                    {/* Strengths */}
                    {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                      <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                        <div className="flex gap-2 items-center mb-2">
                          <CheckCircle className="text-green-600 w-5 h-5" />
                          <span className="font-bold text-green-800">Strengths</span>
                        </div>
                        <ul className="list-disc ml-6 text-slate-800 text-sm space-y-1">
                          {analysis.strengths.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Improvements */}
                    {Array.isArray(analysis.improvements) && analysis.improvements.length > 0 && (
                      <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                        <div className="flex gap-2 items-center mb-2">
                          <Lightbulb className="text-amber-500 w-5 h-5" />
                          <span className="font-bold text-amber-700">Improvements</span>
                        </div>
                        <ul className="list-disc ml-6 text-slate-800 text-sm space-y-1">
                          {analysis.improvements.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Grammar */}
                    {Array.isArray(analysis.grammar) && analysis.grammar.length > 0 && (
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                        <div className="flex gap-2 items-center mb-2">
                          <Sparkles className="text-blue-500 w-5 h-5" />
                          <span className="font-bold text-blue-700">Grammar Suggestions</span>
                        </div>
                        <ul className="list-disc ml-6 text-slate-800 text-sm space-y-1">
                          {analysis.grammar.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Formatting */}
                    {Array.isArray(analysis.formatting) && analysis.formatting.length > 0 && (
                      <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                        <div className="flex gap-2 items-center mb-2">
                          <Layers className="text-violet-600 w-5 h-5" />
                          <span className="font-bold text-violet-700">Formatting</span>
                        </div>
                        <ul className="list-disc ml-6 text-slate-800 text-sm space-y-1">
                          {analysis.formatting.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Missing Sections */}
                    {Array.isArray(analysis.missingSections) && analysis.missingSections.length > 0 && (
                      <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                        <div className="flex gap-2 items-center mb-2">
                          <Award className="text-orange-500 w-5 h-5" />
                          <span className="font-bold text-orange-700">Missing Sections</span>
                        </div>
                        <ul className="list-disc ml-6 text-slate-800 text-sm space-y-1">
                          {analysis.missingSections.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Summary */}
                    {typeof analysis.summary === "string" && (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex gap-2 items-center mb-2">
                          <FileText className="text-slate-600 w-5 h-5" />
                          <span className="font-bold text-slate-800">Summary</span>
                        </div>
                        <p className="text-slate-700 text-sm">{analysis.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : sections.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    Upload your PDF resume to get started with AI analysis.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    No recommendations available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}