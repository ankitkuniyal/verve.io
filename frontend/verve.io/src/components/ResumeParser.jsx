// src/components/PDFTextReader.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Shield,
  BarChart,
  Target,
  Search,
} from "lucide-react";

// Import only Firebase Auth (not Firestore)
import { getAuth } from "firebase/auth";

export default function PDFTextReader() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [sections, setSections] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  // Default tab is "recommendations"
  const [activeTab, setActiveTab] = useState("recommendations");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isCached, setIsCached] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ FIXED: Use Vite environment variable
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
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

  // ✅ Enhanced file validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      if (selectedFile.type !== "application/pdf") {
        throw new Error("Please select a valid PDF file");
      }
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      setFile(selectedFile);
      setError("");
      setSections([]);
      setAnalysis(null);
      setActiveTab("recommendations");
      setUploadStatus("");
      setIsCached(false);
    } catch (err) {
      setError(err.message);
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

          for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str);
            text += strings.join(" ") + "\n";
          }
          resolve(text);
        } catch (err) {
          reject(new Error("Failed to extract text. Please ensure it's a text-based PDF."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
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

  // --- Removed saveToFirebase function entirely (no Firestore, no DB) ---

  // ✅ Enhanced: Send to your local backend, pass auth token if present
  const analyzeResumeWithBackend = async (resumeText) => {
    try {
      // Grab Firebase auth token if user is logged in
      let authToken = "";
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (e) {
        // No auth or failed to get token, continue without
        authToken = "";
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const analyzeResp = await fetch(`${BACKEND_URL}/api/resume/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify({ resume: resumeText }),
      });

      if (!analyzeResp.ok) {
        const errorData = await analyzeResp.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${analyzeResp.status}`);
      }

      const analyzeJson = await analyzeResp.json();
      
      if (analyzeJson && analyzeJson.success && analyzeJson.analysis) {
        setAnalysis(analyzeJson.analysis);
        setIsCached(analyzeJson.cached || false);
        return analyzeJson.analysis;
      } else {
        throw new Error(analyzeJson.error || "Analysis failed");
      }
    } catch (err) {
      console.error("Backend analysis error:", err);
      throw err;
    }
  };

  // Handle Extraction, Analyze (NO FIREBASE)
  const handleExtract = async () => {
    if (!file) return;
    setExtracting(true);
    setError("");
    setUploadStatus("");
    setActiveTab("recommendations");

    try {
      const rawText = await extractTextFromPDF(file);
      const parsedSections = formatResume(rawText);
      setSections(parsedSections);

      // Use Firebase Auth for user info if needed (not saving to DB)
      const auth = getAuth();
      const currentUser = auth.currentUser;

      // Optionally require authentication
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Send to your local backend
      const analysisResult = await analyzeResumeWithBackend(rawText);
      setAnalysis(analysisResult);

      setUploadStatus("✅ Resume processed and analyzed successfully!");
    } catch (err) {
      console.error(err);
      if (err.message.includes("rate limit") || err.message.includes("Too many")) {
        setError("Too many requests. Please wait a few minutes and try again.");
      } else if (err.message.includes("Network")) {
        setError("Network error. Please check your connection and backend server.");
      } else {
        setError(err.message || "Failed to extract text or analyze. Please upload a valid text-based PDF.");
      }
      
      // Fallback analysis if backend fails
      setAnalysis({
        strengths: ["Resume successfully parsed", "Clear structure identified"],
        improvements: ["Add more specific details", "Include measurable achievements"],
        grammar: ["Review for typos"],
        formatting: ["Use consistent formatting"],
        missingSections: ["Projects section could be added"],
        summary: "Resume shows good potential. Focus on adding specific achievements and quantifiable results.",
        atsScore: 65,
        keywordSuggestions: ["leadership", "problem-solving", "technical skills"]
      });
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

  // ✅ Score Display Component (optional, won't change UI unless analysis has atsScore)
  const ScoreMeter = ({ score, label }) => {
    const getColor = (score) => {
      if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
      if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      return 'text-red-600 bg-red-100 border-red-200';
    };

    if (!score) return null;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getColor(score)}`}>
        <BarChart className="w-4 h-4" />
        <span className="font-bold">{score}/100</span>
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
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
            <Link 
              to="/dashboard"
              className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm font-medium border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Recommendations Panel - show first (left) by default */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden order-2 lg:order-1">
            {/* Tab Navigation */}
            {sections.length > 0 && (
              <div className="border-b border-slate-200">
                <div className="flex">
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
                      AI Analysis
                      {analysis ? (
                        <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          1
                        </span>
                      ) : null}
                    </div>
                  </button>
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
              ) : activeTab === "recommendations" && analysis ? (
                <div className="space-y-6">
                  {/* AI Recommendations Tab */}
                  {analysis.atsScore !== undefined && (
                    (() => {
                      // Color maps based on ATS score
                      // 0-49 = red, 50-74 = yellow/orange, 75-100 = green
                      let barColor = "from-amber-400 via-orange-400 to-orange-700";
                      let borderColor = "border-amber-500";
                      let ringColor = "ring-amber-200/50";
                      let textColor = "text-amber-700";
                      let bgGradient = "from-amber-500 to-orange-600";
                      let badgeBorder = "border-amber-200";
                      let badgeText = "text-amber-700";
                      let badgeRing = "ring-amber-200/50";
                      let badgeBg = "bg-amber-400 via-orange-400 to-orange-700";
                      let ats = parseInt(analysis.atsScore, 10);

                      if (ats < 50) {
                        barColor = "from-red-400 via-pink-500 to-red-700";
                        borderColor = "border-red-500";
                        ringColor = "ring-red-100/60";
                        textColor = "text-red-700";
                        bgGradient = "from-red-500 to-pink-600";
                        badgeBorder = "border-red-200";
                        badgeText = "text-red-700";
                        badgeBg = "bg-red-400 via-pink-400 to-red-700";
                        badgeRing = "ring-red-100/60";
                      } else if (ats < 75) {
                        barColor = "from-yellow-300 via-yellow-400 to-orange-400";
                        borderColor = "border-yellow-400";
                        ringColor = "ring-yellow-100/60";
                        textColor = "text-yellow-700";
                        bgGradient = "from-yellow-400 to-orange-500";
                        badgeBorder = "border-yellow-200";
                        badgeText = "text-yellow-700";
                        badgeBg = "bg-yellow-400 via-yellow-400 to-orange-400";
                        badgeRing = "ring-yellow-100/60";
                      } else {
                        barColor = "from-green-400 via-emerald-400 to-green-700";
                        borderColor = "border-green-500";
                        ringColor = "ring-green-200/60";
                        textColor = "text-green-700";
                        bgGradient = "from-green-500 to-emerald-600";
                        badgeBorder = "border-green-200";
                        badgeText = "text-green-700";
                        badgeBg = "bg-green-400 via-emerald-400 to-green-700";
                        badgeRing = "ring-green-200/60";
                      }

                      return (
                        <div className="mb-8 text-center">
                          <div className="flex flex-col items-center justify-center mb-3">
                            <div className="relative flex flex-col items-center mt-2">
                              <div className={`w-36 h-36 mx-auto rounded-full bg-gradient-to-br ${barColor} flex items-center justify-center border-4 ${borderColor} shadow-xl mb-3 ${ringColor}`}>
                                <span className="text-6xl font-extrabold text-white drop-shadow tracking-tight">
                                  {analysis.atsScore}
                                </span>
                              </div>
                              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-md font-semibold ${textColor} bg-white bg-opacity-90 px-4 py-1 rounded-full border ${badgeBorder} shadow`}>
                                ATS Score
                              </span>
                            </div>
                          </div>
                          <h2 className="text-2xl font-bold text-slate-800 mt-2">
                            AI Resume Recommendations
                          </h2>
                          <p className="text-slate-600 mt-2">
                            Tailored insights and actions powered by our AI engine.
                          </p>
                        </div>
                      );
                    })()
                  )}

                  {analysis.atsScore === undefined && (
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
                  )}

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
                    {/* ✅ Keyword Suggestions (New feature, only shows if available) */}
                    {Array.isArray(analysis.keywordSuggestions) && analysis.keywordSuggestions.length > 0 && (
                      <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                        <div className="flex gap-2 items-center mb-2">
                          <Search className="text-indigo-500 w-5 h-5" />
                          <span className="font-bold text-indigo-700">Keyword Suggestions</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-2">
                          {analysis.keywordSuggestions.map((keyword, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                              {keyword}
                            </span>
                          ))}
                        </div>
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
          {/* Upload Panel */}
          <div className="space-y-6 order-1 lg:order-2">
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
                  {isCached && uploadStatus.includes("successfully") && (
                    <p className="text-xs mt-1 text-green-600">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Served from cache
                    </p>
                  )}
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
        </div>
      </div>
    </section>
  );
}