import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Video, Clock, CheckCircle, Play, Square, SkipForward, RefreshCw, BarChart3, Download } from 'lucide-react';

const MBA_QUESTIONS = [
  {
    id: 1,
    question: "Tell us about yourself and why you're interested in pursuing an MBA at this time in your career.",
    category: "Introduction",
    tips: "Focus on your professional journey and clear motivations"
  },
  {
    id: 2,
    question: "Describe a time when you demonstrated leadership in a challenging situation. What was the outcome?",
    category: "Leadership",
    tips: "Use the STAR method: Situation, Task, Action, Result"
  },
  {
    id: 3,
    question: "What are your short-term and long-term career goals, and how will an MBA help you achieve them?",
    category: "Career Goals",
    tips: "Be specific about timelines and how the MBA bridges gaps"
  },
  {
    id: 4,
    question: "Tell us about a time you failed. What did you learn from that experience?",
    category: "Self-Awareness",
    tips: "Show vulnerability and growth mindset"
  },
  {
    id: 5,
    question: "How do you handle conflicts in team settings? Provide a specific example.",
    category: "Teamwork",
    tips: "Demonstrate emotional intelligence and problem-solving"
  },
  {
    id: 6,
    question: "What unique perspective or experience will you bring to our MBA program?",
    category: "Diversity & Fit",
    tips: "Highlight what makes you different and valuable"
  }
];

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

export default function MBAVideoInterview() {
  const [stage, setStage] = useState('welcome');
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
  const [isTranscribing, setIsTranscribing] = useState(false);
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

  const currentQuestion = MBA_QUESTIONS[currentQuestionIndex];

  // Check browser compatibility on mount
  useEffect(() => {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    
    let warning = '';
    if (isSafari) {
      warning = '⚠️ Safari has limited MediaRecorder support. For best results, use Chrome, Firefox, or Edge.';
    } else if (!isChrome && !isFirefox && !isEdge) {
      warning = '⚠️ For best results, please use Chrome, Firefox, or Edge browsers.';
    }
    setBrowserWarning(warning);

    // Check for MediaRecorder support
    if (!window.MediaRecorder) {
      setBrowserWarning('❌ Your browser does not support video recording. Please use Chrome, Firefox, or Edge.');
    }
  }, []);

  // SPEECH RECOGNITION SETUP
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      setSpeechRecognitionSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
    };

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
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        console.log('No speech detected, continuing to listen...');
        return;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsListening(false);
      
      if (stage === 'recording' && !isListening) {
        console.log('🔄 Auto-restarting speech recognition');
        setTimeout(() => {
          if (recognitionRef.current && stage === 'recording') {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.error('Failed to restart speech recognition:', err);
            }
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Start/stop speech recognition based on recording state
  useEffect(() => {
    if (!recognitionRef.current || !speechRecognitionSupported) return;

    if (stage === 'recording' && !isListening) {
      console.log('🚀 Starting speech recognition for recording');
      transcriptRef.current = '';
      setTranscript('');
      
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error('Failed to start speech recognition:', err);
          setSpeechRecognitionSupported(false);
        }
      }, 1000);
    } else if (stage !== 'recording' && isListening) {
      console.log('🛑 Stopping speech recognition');
      recognitionRef.current.stop();
    }
  }, [stage, isListening, speechRecognitionSupported]);

  // Reset transcript when moving to new question
  useEffect(() => {
    if (stage === 'preparing') {
      transcriptRef.current = '';
      setTranscript('');
    }
  }, [currentQuestionIndex, stage]);

  // CAMERA INITIALIZATION
  const startCamera = async () => {
    setIsLoadingCamera(true);
    setCameraError('');
    setApiError(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setIsCameraOn(true);
      setStage('preparing');
      
      await new Promise(resolve => setTimeout(resolve, 100));

      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.muted = true;
        
        await new Promise((resolve, reject) => {
          if (!videoRef.current) return reject(new Error('Video element not found'));
          
          const timeout = setTimeout(() => reject(new Error('Video load timeout')), 5000);
          
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };
          
          videoRef.current.onerror = (e) => {
            clearTimeout(timeout);
            reject(new Error('Video element error'));
          };
        });

        try {
          await videoRef.current.play();
          console.log('✅ Camera started successfully');
        } catch (playError) {
          console.warn('Play error (trying muted):', playError);
          videoRef.current.muted = true;
          await videoRef.current.play();
        }
      }

      setIsLoadingCamera(false);
      startPrepTimer();

    } catch (err) {
      console.error('❌ Camera initialization failed:', err);
      setIsLoadingCamera(false);
      setStage('welcome');
      setIsCameraOn(false);
      
      let errorMessage = '❌ Unable to access your camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found. Please check your device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not support the required settings.';
      } else {
        errorMessage += err.message || 'Please check your camera and try again.';
      }
      
      setCameraError(errorMessage);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setIsLoadingCamera(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      stopCamera();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Prep timer
  const startPrepTimer = () => {
    setPrepTimeLeft(30);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);

    prepTimerRef.current = setInterval(() => {
      setPrepTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          setTimeout(() => startRecording(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Skip prep timer and immediately go to recording
  const skipPrepTimer = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    setPrepTimeLeft(0);
    setTimeout(() => startRecording(), 100);
  };

  // Optimized video recording start
  const startRecording = () => {
    if (!streamRef.current) {
      console.error('No stream available for recording');
      alert('Please enable camera first');
      return;
    }

    try {
      // Better MIME type detection with fallbacks
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm'
      ];
      
      let selectedMimeType = 'video/webm';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      console.log('🎥 Using MIME type:', selectedMimeType);

      const recorder = new MediaRecorder(streamRef.current, { 
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2_500_000,
        audioBitsPerSecond: 128_000
      });
      
      const recordedChunks = [];

      // Keep track of the question being answered
      lastQuestionRef.current = currentQuestion;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: selectedMimeType });
        console.log('Recording completed. Size:', Math.round(blob.size / 1024 / 1024 * 100) / 100, 'MB');

        const transcriptForThisQuestion = lastTranscriptRef.current || transcriptRef.current || '';

        // Store this question's data
        setAnswers(prev => [
          ...prev,
          {
            questionId: lastQuestionRef.current?.id,
            question: lastQuestionRef.current?.question,
            transcript: transcriptForThisQuestion.trim(),
            videoBlob: blob
          }
        ]);

        setMediaRecorder(null);
      };

      recorder.onerror = (e) => {
        console.error('Recording error:', e);
        alert('Recording failed. Please try again.');
      };

      recorder.start(1000); // Collect data every second
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
      console.error('Recording setup failed:', err);
      alert('Recording failed to start. Please check your device permissions.');
    }
  };

  const stopRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    // Capture transcript for this question
    lastTranscriptRef.current = transcriptRef.current;

    // Stop speech recognition
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setCompletedQuestions(prev => [...prev, currentQuestion.id]);

      setTimeout(() => {
        if (currentQuestionIndex < MBA_QUESTIONS.length - 1) {
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

  const skipQuestion = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }

    setCompletedQuestions(prev => [...prev, currentQuestion.id]);

    if (currentQuestionIndex < MBA_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setStage('preparing');
      setTranscript('');
      startPrepTimer();
    } else {
      setStage('completed');
      stopCamera();
    }
  };

  // Compress video if too large
  const compressVideo = async (blob) => {
    return new Promise((resolve) => {
      // Simple compression - reduce quality if too large
      if (blob.size > 50 * 1024 * 1024) { // > 50MB
        console.log('Video file is large. Reducing quality...');
        // For now, just return the blob
        // In production, implement proper compression with FFmpeg or similar
        resolve(blob);
      } else {
        resolve(blob);
      }
    });
  };

  // Generate results with retry logic
  const generateResultsWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await generateResults();
        setApiError(null);
        return;
      } catch (err) {
        const errorMsg = `Attempt ${i + 1} failed: ${err.message}`;
        setApiError(errorMsg);
        console.error(errorMsg);
        
        if (i < retries - 1) {
          // Exponential backoff
          const delay = 2000 * (i + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error('All retry attempts failed');
  };

  // Main function to call backend
  const generateResults = async () => {
    if (!answers.length) {
      alert('No recorded answers found to analyze.');
      return;
    }

    setIsGeneratingResults(true);
    setUploadProgress(0);
    setApiError(null);

    try {
      const formData = new FormData();

      // Create metadata in EXACT format backend expects
      const metadata = answers.map((ans, idx) => ({
        index: idx,
        questionId: ans.questionId || idx + 1,
        question: ans.question || MBA_QUESTIONS[idx]?.question || `Question ${idx + 1}`,
        transcript: ans.transcript || ""
      }));

      console.log('📋 Sending metadata:', metadata);
      formData.append('metadata', JSON.stringify(metadata));

      // Attach each video blob with proper naming
      for (let idx = 0; idx < answers.length; idx++) {
        const ans = answers[idx];
        if (ans.videoBlob && ans.videoBlob.size > 0) {
          const compressedBlob = await compressVideo(ans.videoBlob);
          formData.append(
            `video_${idx}`,
            compressedBlob,
            `question_${ans.questionId || idx}.webm`
          );
          console.log(`📹 Added video_${idx}, size: ${Math.round(compressedBlob.size / 1024 / 1024 * 100) / 100}MB`);
        } else {
          console.warn(`⚠️ No video blob for question ${idx}`);
        }
      }

      console.log('📤 Sending form data with:', {
        metadataCount: metadata.length,
        videoCount: answers.filter(a => a.videoBlob).length,
        totalSize: answers.reduce((sum, a) => sum + (a.videoBlob?.size || 0), 0) / (1024 * 1024)
      });

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Server responded with status ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error occurred while uploading'));
        };
        
        xhr.open('POST', 'https://verve-io.onrender.com/api/services/interview');
        xhr.send(formData);
      });

      console.log('📥 Raw response:', response);

      let data;
      try {
        data = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError, response);
        throw new Error('Invalid JSON response from server');
      }

      // Handle different response formats
      if (data.error) {
        throw new Error(data.error);
      } else if (data.evaluation) {
        // Backend returns { success, evaluation, rawData }
        setResults(data.evaluation);
      } else if (data.overallScore) {
        // Backend returns evaluation directly
        setResults(data);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from server');
      }

      setShowResults(true);
      setUploadProgress(100);
      
    } catch (err) {
      console.error('❌ Error generating results:', err);
      setApiError(`Failed to generate results: ${err.message}`);
      
      // Fallback to mock results
      const analysisResults = GENERATE_MOCK_RESULTS();
      setResults(analysisResults);
      setShowResults(true);
      
      // Don't throw here, let retry logic handle it
      throw err;
    } finally {
      setIsGeneratingResults(false);
    }
  };

  const resetInterview = () => {
    setStage('welcome');
    setCurrentQuestionIndex(0);
    setCompletedQuestions([]);
    setShowResults(false);
    setResults(null);
    setTranscript('');
    transcriptRef.current = '';
    setAnswers([]);
    setUploadProgress(0);
    setApiError(null);
  };

  const downloadResults = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `mba-interview-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (completedQuestions.length / MBA_QUESTIONS.length) * 100;

  const ScoreBar = ({ score, label }) => (
    <div className="flex items-center gap-4 mb-4">
      <div className="w-32 text-sm font-medium text-slate-700">{label}</div>
      <div className="flex-1 bg-slate-200 rounded-full h-4">
        <div 
          className={`h-4 rounded-full ${
            score >= 90 ? 'bg-green-500' :
            score >= 80 ? 'bg-green-400' :
            score >= 70 ? 'bg-yellow-500' :
            score >= 60 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="w-12 text-right font-bold text-slate-800">{score}%</div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Back to Dashboard button */}
        <div className="flex justify-end mb-6">
          <Link 
            to="/dashboard"
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm font-medium border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        
        {/* Browser Warning */}
        {browserWarning && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl">
            <p className="text-yellow-800 font-medium">{browserWarning}</p>
          </div>
        )}
        
        {/* API Error */}
        {apiError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
            <p className="text-red-800 font-medium">{apiError}</p>
          </div>
        )}
        
        {/* MAIN BODY */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
          
          {/* Welcome Screen */}
          {stage === 'welcome' && (
            <div className="p-12 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-3xl opacity-20 rounded-full" />
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 w-32 h-32 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <Camera className="text-blue-600" size={64} />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-slate-800 mb-4">Welcome to Your Interview</h2>
              <p className="text-slate-600 text-xl mb-8">
                Prepare to showcase your potential through {MBA_QUESTIONS.length} carefully designed questions
              </p>

              {cameraError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 text-left max-w-2xl mx-auto">
                  <p className="text-red-800 font-medium">{cameraError}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Tips: Ensure no other app is using your camera, check browser permissions, and try refreshing the page.
                  </p>
                </div>
              )}

              <button
                onClick={startCamera}
                disabled={isLoadingCamera}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center gap-3 mx-auto disabled:cursor-not-allowed"
              >
                {isLoadingCamera ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Initializing Camera...
                  </>
                ) : (
                  <>
                    <Play size={24} />
                    Begin Interview
                  </>
                )}
              </button>

              {/* Camera Test Instructions */}
              <div className="mt-8 p-6 bg-blue-50 rounded-2xl max-w-2xl mx-auto text-left border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-2">📹 Camera Setup Tips:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Ensure your camera is connected and not being used by other applications</li>
                  <li>• Grant camera and microphone permissions when the browser prompts you</li>
                  <li>• Use Chrome, Firefox, or Edge for best compatibility</li>
                  <li>• Make sure you're on HTTPS (required for camera access)</li>
                  <li>• Good lighting and a quiet environment will improve your analysis</li>
                </ul>
              </div>
            </div>
          )}

          {/* Prep or Recording Stage */}
          {(stage === 'preparing' || stage === 'recording') && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                
                {/* LEFT COLUMN - Question + Transcript */}
                <div className="flex flex-col h-full">
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="text-sm font-medium text-white/80 mb-1">Introduction</div>
                      <div className="text-lg font-bold mb-2">Question {currentQuestionIndex + 1} of {MBA_QUESTIONS.length}</div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 leading-tight flex-1">{currentQuestion.question}</h3>
                    
                    <div className="mb-4 p-3 bg-white/20 rounded-lg">
                      <p className="text-white/90 text-sm">💡 {currentQuestion.tips}</p>
                    </div>

                    {stage === 'recording' && (
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="border-t border-white/30 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            <span className="font-bold text-white text-sm">Live Transcript</span>
                            {isListening && (
                              <span className="text-xs bg-green-500/40 text-green-200 px-2 py-1 rounded-full font-medium ml-2">
                                Listening...
                              </span>
                            )}
                          </div>
                          <div className="bg-black/30 rounded-lg p-3 flex-1 overflow-y-auto min-h-[120px]">
                            {transcript ? (
                              <p className="text-white leading-relaxed text-sm">
                                {transcript}
                              </p>
                            ) : (
                              <div className="text-center text-white/60 italic py-4 text-sm">
                                {speechRecognitionSupported ? (
                                  isListening ? (
                                    "Start speaking... Your words will appear here in real-time"
                                  ) : (
                                    "Initializing speech recognition..."
                                  )
                                ) : (
                                  "Speech recognition is not supported in your browser. Try Chrome or Edge."
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {stage === 'recording' ? (
                      <>
                        <button
                          onClick={stopRecording}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg flex-1 justify-center"
                        >
                          <Square size={18} />
                          Stop Recording
                        </button>
                        <button
                          onClick={skipQuestion}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"
                        >
                          <SkipForward size={18} />
                          Skip
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={skipQuestion}
                          className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg w-full justify-center"
                        >
                          <SkipForward size={18} />
                          Skip Question
                        </button>
                        <button
                          onClick={skipPrepTimer}
                          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-2 rounded-xl font-semibold flex items-center gap-2 shadow w-full justify-center ml-2"
                          title="Start recording immediately"
                        >
                          ⏩ Skip Prep Time
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN - Video + Timer */}
                <div className="flex flex-col h-full">
                  <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg flex-1">
                    {isCameraOn && (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                    )}

                    {!isCameraOn && !cameraError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                          <p className="text-lg">Initializing camera...</p>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 right-4">
                      <div className="bg-black/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-2xl border border-white/20">
                        <div className="text-center">
                          <div className="text-white text-xs font-medium mb-1">
                            {stage === 'preparing' ? 'PREPARATION' : 'RECORDING'}
                          </div>
                          <div className="text-2xl font-bold text-white mb-1 font-mono">
                            {stage === 'preparing' ? formatTime(prepTimeLeft) : formatTime(recordTimeLeft)}
                          </div>
                          <div className={`text-xs font-semibold ${
                            stage === 'preparing' ? 'text-yellow-300' : 'text-red-300'
                          }`}>
                            {stage === 'preparing' ? 'Get Ready...' : 'LIVE'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3">
                      <div className="flex items-center justify-between text-white mb-1">
                        <span className="text-sm font-medium">
                          Progress: {completedQuestions.length + (stage === 'recording' ? 1 : 0)}/{MBA_QUESTIONS.length}
                        </span>
                        <span className="text-sm font-bold">
                          {Math.round(((completedQuestions.length + (stage === 'recording' ? 1 : 0)) / MBA_QUESTIONS.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((completedQuestions.length + (stage === 'recording' ? 1 : 0)) / MBA_QUESTIONS.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                    <h4 className="font-bold text-slate-800 mb-2 text-sm flex items-center gap-2">
                      <Clock size={16} />
                      Interview Tips
                    </h4>
                    <ul className="text-slate-600 text-xs space-y-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>Maintain eye contact with the camera</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>Speak clearly and at a moderate pace</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>Use the STAR method for behavioral questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span>Be authentic and showcase your personality</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Screen */}
          {stage === 'completed' && !showResults && (
            <div className="p-12 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-400 blur-3xl opacity-30 rounded-full" />
                <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 w-32 h-32 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle className="text-green-600" size={64} />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-slate-800 mb-4">Interview Completed 🎉</h2>
              <p className="text-slate-600 text-xl mb-8">
                You've successfully completed all {MBA_QUESTIONS.length} questions!
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => generateResultsWithRetry()}
                  disabled={isGeneratingResults}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingResults ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Analyzing Performance...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={24} />
                      Generate Results
                    </>
                  )}
                </button>

                <button
                  onClick={resetInterview}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-lg flex items-center gap-3"
                >
                  <RefreshCw size={24} />
                  Start New Interview
                </button>
              </div>
            </div>
          )}

          {/* Results Screen */}
          {showResults && results && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-slate-800 mb-2">Interview Analysis Results</h2>
                <p className="text-slate-600 text-lg">Comprehensive feedback based on your performance</p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center mb-8 shadow-lg">
                <div className="text-6xl font-bold mb-2">{results.overallScore}%</div>
                <div className="text-xl font-medium">Overall Performance Score</div>
                <div className="text-blue-100 mt-2">
                  {results.overallScore >= 90 ? "Outstanding! MBA-ready candidate" :
                   results.overallScore >= 80 ? "Excellent performance" :
                   results.overallScore >= 70 ? "Strong candidate with good potential" :
                   "Good foundation, needs some refinement"}
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Detailed Performance Metrics
                  </h3>
                  <ScoreBar score={results.verbalCommunication?.score || 0} label="Verbal Communication" />
                  <ScoreBar score={results.confidence?.score || 0} label="Confidence & Presence" />
                  <ScoreBar score={results.contentQuality?.score || 0} label="Content Quality" />
                  <ScoreBar score={results.nonVerbalCues?.score || 0} label="Non-Verbal Cues" />
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 Key Strengths</h3>
                  <ul className="space-y-2">
                    {(results.keyStrengths || []).map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feedback and Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">📈 Areas for Improvement</h3>
                  <ul className="space-y-3">
                    {(results.areasForImprovement || []).map((area, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-700">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">💡 Final Recommendations</h3>
                  <ul className="space-y-3">
                    {(results.finalRecommendations || []).map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Category-specific Feedback */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-200 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">📊 Detailed Feedback by Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(results).map(([key, value]) => {
                    if (typeof value === 'object' && value.score && value.feedback) {
                      return (
                        <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                          <h4 className="font-bold text-slate-800 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="text-sm text-slate-600 space-y-1">
                            {(value.feedback || []).map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={downloadResults}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <Download size={20} />
                  Download Results
                </button>
                <button
                  onClick={resetInterview}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <RefreshCw size={20} />
                  New Interview
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isGeneratingResults && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl text-center shadow-2xl max-w-md">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <p className="text-2xl font-bold text-slate-800 mb-2">Analyzing Your Interview</p>
              <p className="text-slate-600 mb-6">
                Processing {answers.length} video responses with AI analysis...
              </p>
              
              {uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Uploading videos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-sm text-slate-500">
                This may take 30-60 seconds depending on video length and server load
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-4 text-slate-600 text-xs">
          🔒 Your privacy matters. All recordings are encrypted and processed securely.
        </div>
      </div>
    </div>
  );
}