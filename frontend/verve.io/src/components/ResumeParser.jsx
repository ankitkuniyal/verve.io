// src/components/PDFTextReader.jsx
import React, { useState, useRef, useEffect } from "react";
import {
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
  const [recommendations, setRecommendations] = useState([]);
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
      setRecommendations([]);
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

  // Generate Recommendations
  const generateRecommendations = (sections) => {
    const hardcodedRecommendations = [
      {
        id: 1,
        title: "Add Quantifiable Achievements",
        description:
          "Include metrics like 'increased efficiency by 30%' or 'managed team of 5 people' to make your accomplishments stand out.",
        priority: "high",
      },
      {
        id: 2,
        title: "Include More Technical Skills",
        description:
          "Consider adding specific programming languages, tools, and frameworks you're proficient with.",
        priority: "medium",
      },
      {
        id: 3,
        title: "Optimize Project Descriptions",
        description:
          "Add links to GitHub repositories or live demos for your projects to provide tangible proof of your work.",
        priority: "medium",
      },
      {
        id: 4,
        title: "Professional Summary",
        description:
          "Add a 2-3 sentence professional summary at the top to quickly showcase your value proposition.",
        priority: "low",
      },
      {
        id: 5,
        title: "Certification Dates",
        description:
          "Include completion dates for your certifications to show they're current and relevant.",
        priority: "low",
      },
    ];

    const content = sections.map((s) => s.content.join(" ")).join(" ").toLowerCase();

    let filteredRecs = hardcodedRecommendations;
    if (sections.some((s) => s.title.toLowerCase().includes("skill"))) {
      filteredRecs = filteredRecs.filter((rec) => rec.id !== 2);
    }
    const projectsSection = sections.find((s) =>
      s.title.toLowerCase().includes("project")
    );
    if (projectsSection && projectsSection.content.length > 2) {
      filteredRecs = filteredRecs.filter((rec) => rec.id !== 3);
    }

    return filteredRecs;
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

  // Handle Extraction and Upload
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

      const recs = generateRecommendations(parsedSections);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
      setError("Failed to extract text. Please upload a valid text-based PDF.");
    } finally {
      setExtracting(false);
    }
  };

  // Section icons
  const iconForSection = (title) => {
    const map = {
      Profile: <BookOpen className="w-5 h-5 text-indigo-600" />,
      Projects: <Code className="w-5 h-5 text-indigo-600" />,
      Achievements: <Award className="w-5 h-5 text-indigo-600" />,
      Education: <GraduationCap className="w-5 h-5 text-indigo-600" />,
      Certifications: <Layers className="w-5 h-5 text-indigo-600" />,
      "Technical Skills and Interests": (
        <Sparkles className="w-5 h-5 text-indigo-600" />
      ),
      "Positions of Responsibility": (
        <Briefcase className="w-5 h-5 text-indigo-600" />
      ),
    };
    return map[title] || <FileText className="w-5 h-5 text-indigo-600" />;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MBA PDF Resume Parser
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Extract and store your resume data directly with personal insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Upload Resume PDF
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
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
                className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" /> Extract & Save
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
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Tab Navigation */}
            {sections.length > 0 && (
              <div className="border-b border-slate-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("extracted")}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                      activeTab === "extracted"
                        ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      Summarized Resume
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
                      Recommendations
                      {recommendations.length > 0 && (
                        <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {recommendations.length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div className="p-8 overflow-y-auto max-h-[85vh]">
              {extracting ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">
                    Extracting and saving your resume...
                  </p>
                </div>
              ) : activeTab === "extracted" && sections.length > 0 ? (
                <div className="space-y-10">
                  {sections.map((section, i) => (
                    <div key={i} className="border-b border-slate-200 pb-6">
                      <div className="flex items-center gap-2 mb-4">
                        {iconForSection(section.title)}
                        <h2 className="text-2xl font-semibold text-indigo-700">
                          {section.title}
                        </h2>
                      </div>
                      <div className="space-y-2 text-slate-700 text-sm leading-relaxed">
                        {section.content.map((line, idx) =>
                          line.startsWith("•") ? (
                            <p
                              key={idx}
                              className="ml-4 before:content-['•'] before:mr-2 before:text-indigo-600"
                            >
                              {line.replace("•", "").trim()}
                            </p>
                          ) : (
                            <p key={idx}>{line}</p>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === "recommendations" && recommendations.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Lightbulb className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                    <h2 className="text-2xl font-semibold text-slate-800">
                      Resume Recommendations
                    </h2>
                    <p className="text-slate-600 mt-2">
                      Suggestions to improve your resume based on our analysis
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-lg border ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                              rec.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : rec.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {rec.priority}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              {rec.title}
                            </h3>
                            <p className="text-sm opacity-80">
                              {rec.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : sections.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">
                    Upload your PDF to extract and store data.
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
    </div>
  );
}