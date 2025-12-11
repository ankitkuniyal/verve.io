import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth'; 

// Sub-components
import InterviewSetup from './interview/InterviewSetup';
import InterviewWelcome from './interview/InterviewWelcome';
import InterviewActive from './interview/InterviewActive';
import InterviewResults from './interview/InterviewResults';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Fallback mock results
const GENERATE_MOCK_RESULTS = () => ({
  overallScore: Math.floor(Math.random() * 30) + 70,
  verbalCommunication: {
    score: Math.floor(Math.random() * 25) + 75,
    feedback: [
      "Clear and articulate speech patterns detected",
      "Good use of professional vocabulary",
      "Well-structured responses with logical flow",
      "Appropriate pacing and minimal filler words"
    ],
    recommendations: [
      "Practice varying tone to emphasize key points",
      "Incorporate more industry-specific terminology",
      "Work on reducing occasional repetition"
    ]
  },
  confidence: {
    score: Math.floor(Math.random() * 25) + 70,
    feedback: [
      "Demonstrated strong self-assurance in responses",
      "Maintained composure throughout challenging questions",
      "Assertive yet respectful communication style",
      "Good eye contact and posture maintained"
    ],
    recommendations: [
      "Practice speaking with more vocal variety",
      "Incorporate more specific data to support claims",
      "Work on projecting even more authority in leadership examples"
    ]
  },
  contentQuality: {
    score: Math.floor(Math.random() * 30) + 70,
    feedback: [
      "Strong use of STAR method in behavioral questions",
      "Clear connection between experience and MBA goals",
      "Good examples of leadership and teamwork",
      "Demonstrated self-awareness in failure discussion"
    ],
    recommendations: [
      "Include more quantifiable achievements in examples",
      "Strengthen connection between past experience and future goals",
      "Add more specific program-specific insights"
    ]
  },
  nonVerbalCues: {
    score: Math.floor(Math.random() * 20) + 75,
    feedback: [
      "Professional appearance and demeanor",
      "Good facial expressions showing engagement",
      "Appropriate gestures to emphasize points",
      "Consistent eye contact with camera"
    ],
    recommendations: [
      "Practice more natural smiling to build rapport",
      "Use slightly more hand gestures for emphasis",
      "Ensure consistent lighting for better video quality"
    ]
  },
  keyStrengths: [
    "Strong leadership examples with measurable outcomes",
    "Clear career vision and MBA rationale",
    "Excellent communication skills and articulation",
    "Good emotional intelligence in team scenarios",
    "Professional presence and demeanor"
  ],
  areasForImprovement: [
    "Incorporate more data-driven examples",
    "Strengthen program-specific knowledge",
    "Enhance storytelling in personal examples",
    "Increase specificity in goal-setting"
  ],
  finalRecommendations: [
    "Continue practicing with mock interviews monthly",
    "Research specific MBA program offerings more deeply",
    "Develop 3-5 quantifiable achievement stories",
    "Join public speaking groups for additional practice",
    "Schedule informational interviews with current students"
  ]
});

// Utility: Get auth token from Firebase
async function getAuthHeaders() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  } catch (error) {
    console.error("Error getting auth token:", error);
    return {};
  }
}

export default function MBAVideoInterview() {
  // Stages: 'setup' -> 'welcome' -> 'preparing' -> 'recording' -> 'completed'
  const [stage, setStage] = useState('setup');
  
  // Setup Data
  const [resumeText, setResumeText] = useState('');
  const [targetSchool, setTargetSchool] = useState('');
  const [exam, setExam] = useState('CAT');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [remainingCredits, setRemainingCredits] = useState(null);
  
  // PDF Extraction State
  const [isExtracting, setIsExtracting] = useState(false);

  // Interview State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [prepTimeLeft, setPrepTimeLeft] = useState(30);
  const [recordTimeLeft, setRecordTimeLeft] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [browserWarning, setBrowserWarning] = useState('');

  // Store per-question recorded data
  const [answers, setAnswers] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const prepTimerRef = useRef(null);
  const recordTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  // Keep last transcript & question safe
  const lastTranscriptRef = useRef('');
  const lastQuestionRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Check browser compatibility on mount
  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    
    let warning = '';
    if (isSafari) {
      warning = '⚠️ Safari has limited MediaRecorder support. For best results, use Chrome, Firefox, or Edge.';
    } else if (!isChrome) {
      warning = '⚠️ For best results, please use Chrome, Firefox, or Edge browsers.';
    }
    setBrowserWarning(warning);

    if (!window.MediaRecorder) {
      setBrowserWarning('❌ Your browser does not support video recording. Please use Chrome, Firefox, or Edge.');
    }
  }, []);

  // Load PDF.js
  useEffect(() => {
    if (window.pdfjsLib) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
    };
    return () => {
      // document.body.removeChild(script); 
    };
  }, []);

  // --------------- PDF EXTRACTION ----------------
  const extractTextFromPDF = async (pdfFile) => {
    if (!window.pdfjsLib) {
        throw new Error("PDF parser not loaded yet. Please try again in a moment.");
    }
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to 10 pages
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item) => item.str);
        text += strings.join(" ") + "\n";
    }
    return text;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
        setApiError("Please upload a PDF file.");
        return;
    }

    setIsExtracting(true);
    setApiError("");
    setResumeText("Extracting text from resume...");
    
    try {
        const text = await extractTextFromPDF(file);
        if (text.trim().length < 50) {
            throw new Error("Could not extract enough text from this PDF. It might be scanned/image-based.");
        }
        setResumeText(text);
    } catch (err) {
        console.error(err);
        setApiError(err.message || "Failed to read PDF.");
        setResumeText(""); 
    } finally {
        setIsExtracting(false);
    }
  };

  // --------------- GENERATION LOGIC ----------------
  const handleGenerateQuestions = async () => {
    if (!resumeText || !targetSchool) {
      setApiError("Please enter your resume and target school.");
      return;
    }

    setIsGeneratingQuestions(true);
    setApiError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/api/services/interview/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers // spread the awaited headers object
        },
        body: JSON.stringify({
          resumeText,
          targetSchool,
          exam
        })
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        if (response.status === 403 && data.requiresSubscription) {
            throw new Error(`Insufficient Credits. Please upgrade or contact support.`);
        }
        throw new Error(data.error || "Failed to generate questions");
      }

      if (data.success && data.data && data.data.questions) {
        // Map backend questions to our format
        const mappedQuestions = data.data.questions.map((q, idx) => ({
            id: q.id || idx + 1,
            question: q.text, // Text from Gemini
            category: q.type || "General",
            tips: q.context || "Be specific and confident."
        }));

        setQuestions(mappedQuestions);
        setRemainingCredits(data.remainingCredits);
        setStage('welcome');
      } else {
        throw new Error("Invalid response format");
      }

    } catch (err) {
      console.error(err);
      setApiError(err.message);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // --------------- SPEECH RECOGNITION ---------------
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechRecognitionSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptRef.current += transcriptPart + ' ';
        } else {
          interimTranscript += transcriptPart;
        }
      }
      setTranscript(transcriptRef.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') return;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (stage === 'recording' && !isListening) {
        setTimeout(() => {
          if (recognitionRef.current && stage === 'recording') {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current || !speechRecognitionSupported) return;
    if (stage === 'recording' && !isListening) {
      transcriptRef.current = '';
      setTranscript('');
      setTimeout(() => { try { recognitionRef.current.start(); } catch (e) {} }, 1000);
    } else if (stage !== 'recording' && isListening) {
      recognitionRef.current.stop();
    }
  }, [stage, isListening]);

  // --------------- CAMERA & RECORDING ---------------
  const startCamera = async () => {
    setIsLoadingCamera(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      streamRef.current = stream;
      setIsCameraOn(true);
      setStage('preparing');
      
      // Allow video element time to mount
      setTimeout(async () => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            try { await videoRef.current.play(); } catch (e) { console.error(e); }
        }
      }, 100);
      
      setIsLoadingCamera(false);
      startPrepTimer();
    } catch (err) {
      console.error(err);
      setIsLoadingCamera(false);
      setStage('welcome');
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOn(false);
  };

  const startPrepTimer = () => {
    setPrepTimeLeft(30);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    prepTimerRef.current = setInterval(() => {
      setPrepTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          setTimeout(startRecording, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipPrepTimer = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setPrepTimeLeft(0);
    setTimeout(startRecording, 100);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    // Choose mimeType
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    let selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: selectedMimeType });
      const chunks = [];
      
      lastQuestionRef.current = currentQuestion;

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType });
        const finalTranscript = lastTranscriptRef.current || transcriptRef.current || '';
        
        setAnswers(prev => [...prev, {
            questionId: lastQuestionRef.current?.id,
            question: lastQuestionRef.current?.question,
            transcript: finalTranscript.trim(),
            videoBlob: blob
        }]);
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setStage('recording');
      setRecordTimeLeft(60);

      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(() => {
        setRecordTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      alert('Recording failed to start.');
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    
    lastTranscriptRef.current = transcriptRef.current;
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setCompletedQuestions(prev => [...prev, currentQuestion.id]);

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setStage('preparing');
          setTranscript('');
          startPrepTimer();
        } else {
          setStage('completed');
          stopCamera();
        }
      }, 1000);
    }
  };

  const generateResults = async () => {
    setIsGeneratingResults(true);
    setApiError(null);
    setUploadProgress(0); // Reset

    try {
      const formData = new FormData();
      const metadata = answers.map((ans, idx) => ({
        index: idx,
        questionId: ans.questionId || idx + 1,
        question: ans.question,
        transcript: ans.transcript || ""
      }));

      formData.append('metadata', JSON.stringify(metadata));

      answers.forEach((ans, idx) => {
        if (ans.videoBlob) {
            formData.append(`video_${idx}`, ans.videoBlob, `q${ans.questionId}.webm`);
        }
      });
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/api/services/interview`, {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      setResults(data.evaluation || data);
      setShowResults(true);
      setUploadProgress(100);

    } catch (err) {
      console.error(err);
      setApiError("Analysis failed. Using mock results for demo.");
      setResults(GENERATE_MOCK_RESULTS());
      setShowResults(true);
    } finally {
      setIsGeneratingResults(false);
    }
  };

  const resetInterview = () => {
    setStage('setup');
    setQuestions([]);
    setResumeText('');
    setCurrentQuestionIndex(0);
    setCompletedQuestions([]);
    setShowResults(false);
    setResults(null);
    setTranscript('');
    setAnswers([]);
  };

  // --------------- MAIN RENDER ----------------
  // Based on "stage" state, render the appropriate sub-component

  if (stage === 'setup') {
    return (
      <InterviewSetup 
        resumeText={resumeText}
        setResumeText={setResumeText}
        targetSchool={targetSchool}
        setTargetSchool={setTargetSchool}
        exam={exam}
        setExam={setExam}
        isExtracting={isExtracting}
        handleFileChange={handleFileChange}
        handleGenerateQuestions={handleGenerateQuestions}
        isGeneratingQuestions={isGeneratingQuestions}
        apiError={apiError}
      />
    );
  }

  if (stage === 'welcome') {
    return (
      <InterviewWelcome 
        questions={questions}
        targetSchool={targetSchool}
        remainingCredits={remainingCredits}
        browserWarning={browserWarning}
        cameraError={cameraError}
        isLoadingCamera={isLoadingCamera}
        startCamera={startCamera}
        resetInterview={resetInterview}
      />
    );
  }

  if (['preparing', 'recording'].includes(stage)) {
    return (
      <InterviewActive
        stage={stage}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        currentQuestion={currentQuestion}
        recordTimeLeft={recordTimeLeft}
        prepTimeLeft={prepTimeLeft}
        skipPrepTimer={skipPrepTimer}
        transcript={transcript}
        videoRef={videoRef}
        stopRecording={stopRecording}
      />
    );
  }

  if (stage === 'completed' || showResults) {
    return (
      <InterviewResults 
        results={results}
        isGeneratingResults={isGeneratingResults}
        uploadProgress={uploadProgress}
        apiError={apiError}
        generateResults={generateResults}
        resetInterview={resetInterview}
      />
    );
  }

  return <div>Loading...</div>;
}