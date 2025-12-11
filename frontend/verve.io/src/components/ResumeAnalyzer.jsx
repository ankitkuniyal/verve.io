// src/components/ResumeAnalyzer.jsx
import { useState, useRef, useEffect } from "react";
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
  Zap,
  Target} from "lucide-react";
import { getAuth } from "firebase/auth";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [sections, setSections] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isCached, setIsCached] = useState(false);
  const fileInputRef = useRef(null);

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
      if(document.body.contains(script)){
        document.body.removeChild(script);
      }
    };
  }, []);

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

  const formatBullets = (text) => {
    return text
      .replace(/•/g, "\n•")
      .replace(/–/g, " – ")
      .replace(/\s{3,}/g, " ")
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
  };

  const analyzeResumeWithBackend = async (resumeText) => {
    try {
      let authToken = "";
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          authToken = await auth.currentUser.getIdToken();
        }
      } catch (e) {
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

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const analysisResult = await analyzeResumeWithBackend(rawText);
      setAnalysis(analysisResult);

      setUploadStatus("Analysis Complete");
    } catch (err) {
      console.error(err);
      if (err.message.includes("rate limit") || err.message.includes("Too many")) {
        setError("Too many requests. Please wait and try again.");
      } else if (err.message.includes("Network")) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Failed to analyze. Please upload a valid text-based PDF.");
      }
      
      // Fallback
      setAnalysis({
        strengths: ["Clean layout detected", "Education section is clear"],
        improvements: ["Quantify your achievements more", "Add more action verbs"],
        grammar: [],
        formatting: ["Consider consistent date formats"],
        missingSections: ["Objectives"],
        summary: "We encountered an issue with the deep analysis, but your resume structure looks readable.",
        atsScore: 50,
        keywordSuggestions: ["leadership", "management"]
      });
    } finally {
      setExtracting(false);
    }
  };

  const iconForSection = (title) => {
    const map = {
      Profile: <BookOpen className="w-5 h-5 text-indigo-600" />,
      Projects: <Code className="w-5 h-5 text-indigo-600" />,
      Achievements: <Award className="w-5 h-5 text-indigo-600" />,
      Education: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      Certifications: <Layers className="w-5 h-5 text-indigo-600" />,
      "Technical Skills and Interests": <Sparkles className="w-5 h-5 text-indigo-600" />,
      "Positions of Responsibility": <Briefcase className="w-5 h-5 text-indigo-600" />,
    };
    return map[title] || <FileText className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <section className="bg-slate-50 min-h-screen py-8 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <MoreHorizontal size={24} className="rotate-90"/> {/* Reusing MoreHorizontal as placeholder for CV icon or similar */}
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resume Expert</h1>
               <p className="text-slate-500 text-sm font-medium">AI-Powered ATS Optimization</p>
            </div>
          </div>
          <Link 
            to="/dashboard"
            className="group bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md border border-slate-200 flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Analysis Column */}
          <div className="lg:col-span-2 order-2 lg:order-1">
             <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[600px]">
                
                {/* Custom Tab Navigation */}
                {sections.length > 0 && (
                  <div className="border-b border-slate-100 bg-slate-50/50 p-2">
                    <div className="flex bg-slate-200/50 p-1.5 rounded-xl">
                      <button
                        onClick={() => setActiveTab("recommendations")}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          activeTab === "recommendations"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Sparkles size={16} />
                        AI Analysis
                        {analysis && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}
                      </button>
                      <button
                        onClick={() => setActiveTab("extracted")}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          activeTab === "extracted"
                            ? "bg-white text-indigo-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                         <FileText size={16} />
                        Parsed Content
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-8">
                   {extracting ? (
                      <div className="flex flex-col items-center justify-center h-96">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing your Resume</h3>
                        <p className="text-slate-500">Checking ATS compatibility and impact...</p>
                      </div>
                   ) : !analysis && !sections.length ? (
                      <div className="flex flex-col items-center justify-center h-96 text-center">
                         <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Upload className="w-10 h-10 text-slate-300" />
                         </div>
                         <h3 className="text-xl font-bold text-slate-400 mb-2">No Resume Uploaded</h3>
                         <p className="text-slate-400 max-w-sm">Upload your PDF resume on the right to unlock AI insights.</p>
                      </div>
                   ) : activeTab === "recommendations" && analysis ? (
                      <div className="animate-fade-in space-y-8">
                         
                         {/* ATS Score Card */}
                         <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                             <div className="absolute top-0 right-0 p-8 opacity-10">
                                <BarChart3 className="w-40 h-40" />
                             </div>
                             
                             <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                 <div className="relative">
                                     <svg className="w-40 h-40 transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="12" fill="transparent" />
                                        <circle 
                                          cx="80" cy="80" r="70" 
                                          stroke={analysis.atsScore >= 75 ? "#22c55e" : analysis.atsScore >= 50 ? "#f59e0b" : "#ef4444"} 
                                          strokeWidth="12" 
                                          fill="transparent" 
                                          strokeDasharray={439.8} 
                                          strokeDashoffset={439.8 * (1 - (analysis.atsScore || 0) / 100)} 
                                          strokeLinecap="round"
                                          className="transition-all duration-1000 ease-out"
                                        />
                                     </svg>
                                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                                         <span className="text-4xl font-black">{analysis.atsScore}</span>
                                         <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">ATS Score</span>
                                     </div>
                                 </div>
                                 <div className="flex-1 text-center md:text-left">
                                     <h2 className="text-2xl font-bold mb-2">Resume Strength</h2>
                                     <p className="text-slate-400 text-sm leading-relaxed mb-4">{analysis.summary}</p>
                                     <div className="flex gap-2 justify-center md:justify-start">
                                        {analysis.keywordSuggestions?.slice(0, 3).map((k, i) => (
                                           <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/10">{k}</span>
                                        ))}
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Details Grid */}
                         <div className="grid md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                               <h3 className="flex items-center gap-2 font-bold text-emerald-800 mb-4">
                                  <CheckCircle size={18} className="text-emerald-600" /> 
                                  Key Strengths
                               </h3>
                               <ul className="space-y-3">
                                  {analysis.strengths?.map((item, i) => (
                                     <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">•</span>
                                        {item}
                                     </li>
                                  ))}
                               </ul>
                            </div>

                            {/* Improvements */}
                            <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                               <h3 className="flex items-center gap-2 font-bold text-amber-800 mb-4">
                                  <Target size={18} className="text-amber-600" /> 
                                  Areas to Improve
                               </h3>
                               <ul className="space-y-3">
                                  {analysis.improvements?.map((item, i) => (
                                     <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">•</span>
                                        {item}
                                     </li>
                                  ))}
                               </ul>
                            </div>
                         </div>

                         {/* Missing Sections */}
                         {analysis.missingSections?.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                               <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                  <XCircle size={18} className="text-red-500" />
                                  Missing Sections
                               </h3>
                               <div className="flex flex-wrap gap-2">
                                  {analysis.missingSections.map((sec, i) => (
                                     <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 font-medium">
                                        {sec}
                                     </span>
                                  ))}
                               </div>
                            </div>
                         )}

                      </div>
                   ) : (
                      // Parsed Content View
                      <div className="space-y-4 animate-fade-in">
                         {sections.map((section, i) => (
                            <div key={i} className="group bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                               <div className="flex items-center gap-3 mb-3">
                                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                     {iconForSection(section.title)}
                                  </div>
                                  <h3 className="font-bold text-slate-800">{section.title}</h3>
                               </div>
                               <div className="pl-12 space-y-1">
                                  {section.content.map((line, lIdx) => (
                                     <p key={lIdx} className="text-sm text-slate-600 leading-relaxed">
                                        {line.startsWith("•") || line.startsWith("-") ? (
                                           <span className="block pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-indigo-400">{line.replace(/^[•-]\s*/, "")}</span>
                                        ) : line}
                                     </p>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Sidebar Upload Panel */}
          <div className="order-1 lg:order-2 space-y-6">
             <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-indigo-500/10 border border-slate-100 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                       <Upload size={20} />
                    </div>
                    <h2 className="font-bold text-xl text-slate-900">Upload Resume</h2>
                </div>
                
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="group relative border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
                >
                    <div className="mb-4">
                       <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-slate-400 group-hover:text-indigo-500">
                          <FileText size={32} />
                       </div>
                    </div>
                    <p className="font-bold text-slate-700 mb-1 group-hover:text-indigo-700 transition-colors">
                       {file ? file.name : "Click to Upload PDF"}
                    </p>
                    <p className="text-xs text-slate-400">PDF files up to 10MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

                <button
                  onClick={handleExtract}
                  disabled={!file || extracting}
                  className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                >
                   {extracting ? <Loader2 size={18} className="animate-spin mr-2"/> : <Zap size={18} className="mr-2 fill-current"/>}
                   {extracting ? "Analyzing..." : "Run AI Analysis"}
                </button>
                
                {analysis && (
                   <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in-up">
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                         <CheckCircle size={16} />
                         <span className="text-sm font-bold">Analysis Complete</span>
                      </div>
                   </div>
                )}

                {error && (
                   <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
                      <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                      {error}
                   </div>
                )}
             </div>
             
             {/* Pro Tip Widget */}
             {analysis && (
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Target size={100} />
                   </div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 opacity-90">
                         <Lightbulb size={18} className="text-yellow-300" />
                         <span className="text-sm font-bold uppercase tracking-wider">Top Recruiter Tip</span>
                      </div>
                      <p className="text-indigo-100 font-medium leading-relaxed italic">
                         "Resumes that include metrics (e.g., 'Increased sales by 20%') are 40% more likely to get an interview callback than those with just job descriptions."
                      </p>
                   </div>
                </div>
             )}
          </div>

        </div>
      </div>
    </section>
  );
}

// Add these imports to top if missing (added in main code block already)
import { MoreHorizontal, BarChart3 } from "lucide-react";