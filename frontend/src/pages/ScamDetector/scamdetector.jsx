import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';

export default function ScamDetector() {
    const [message, setMessage] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const scamPatterns = {
        urgency: {
            keywords: ['urgent', 'immediately', 'act now', 'limited time', 'expires', 'hurry', 'last chance', 'today only', 'within 24 hours'],
            weight: 15,
            description: 'Creates artificial urgency to pressure quick decisions'
        },
        financial: {
            keywords: ['wire transfer', 'gift card', 'bitcoin', 'cryptocurrency', 'western union', 'moneygram', 'cash app', 'venmo', 'zelle', 'paypal fee', 'processing fee', 'customs fee'],
            weight: 20,
            description: 'Requests unusual payment methods'
        },
        threats: {
            keywords: ['suspend', 'locked', 'frozen', 'legal action', 'arrested', 'warrant', 'police', 'irs', 'tax', 'penalty', 'fine'],
            weight: 25,
            description: 'Uses threats or fear tactics'
        },
        tooGoodToBeTrue: {
            keywords: ['congratulations', 'winner', 'won', 'free', 'prize', 'lottery', 'inheritance', 'million', 'guaranteed', 'risk-free', 'no cost'],
            weight: 20,
            description: 'Offers that seem too good to be true'
        },
        personalInfo: {
            keywords: ['verify', 'confirm', 'password', 'pin', 'ssn', 'social security', 'account number', 'credit card', 'banking details', 'personal information'],
            weight: 25,
            description: 'Requests sensitive personal information'
        },
        impersonation: {
            keywords: ['amazon', 'paypal', 'bank of', 'wells fargo', 'chase', 'irs', 'microsoft', 'apple', 'netflix', 'government', 'tech support'],
            weight: 15,
            description: 'Impersonates legitimate organizations'
        },
        links: {
            patterns: [/http[s]?:\/\/(?!(?:www\.)?(?:amazon|paypal|google|microsoft|apple|netflix)\.com)/gi, /bit\.ly|tinyurl|shortened/gi],
            weight: 15,
            description: 'Contains suspicious or shortened links'
        },
        grammar: {
            patterns: [/[A-Z]{5,}/, /\!{2,}/, /\${2,}/],
            weight: 10,
            description: 'Poor grammar, excessive caps, or punctuation'
        }
    };

    const analyzeMessage = () => {
        if (!message.trim()) return;

        setIsAnalyzing(true);

        // Simulate analysis delay
        setTimeout(() => {
            const lowerMessage = message.toLowerCase();
            let totalScore = 0;
            let maxScore = 0;
            const detectedFlags = [];

            // Check keyword-based patterns
            Object.entries(scamPatterns).forEach(([key, pattern]) => {
                if (pattern.keywords) {
                    maxScore += pattern.weight;
                    const found = pattern.keywords.filter(keyword =>
                        lowerMessage.includes(keyword.toLowerCase())
                    );

                    if (found.length > 0) {
                        const score = Math.min(pattern.weight, found.length * 5);
                        totalScore += score;
                        detectedFlags.push({
                            category: key,
                            description: pattern.description,
                            matches: found,
                            severity: score >= pattern.weight * 0.7 ? 'high' : 'medium'
                        });
                    }
                }
            });

            // Check regex patterns
            if (scamPatterns.links.patterns.some(pattern => pattern.test(message))) {
                maxScore += scamPatterns.links.weight;
                totalScore += scamPatterns.links.weight;
                detectedFlags.push({
                    category: 'links',
                    description: scamPatterns.links.description,
                    matches: ['Suspicious URL detected'],
                    severity: 'high'
                });
            }

            if (scamPatterns.grammar.patterns.some(pattern => pattern.test(message))) {
                maxScore += scamPatterns.grammar.weight;
                totalScore += scamPatterns.grammar.weight * 0.5;
                detectedFlags.push({
                    category: 'grammar',
                    description: scamPatterns.grammar.description,
                    matches: ['Formatting issues detected'],
                    severity: 'low'
                });
            }

            // Calculate risk percentage
            const riskPercentage = maxScore > 0 ? Math.min(100, (totalScore / maxScore) * 100) : 0;

            let riskLevel = 'low';
            let riskColor = 'green';
            if (riskPercentage >= 60) {
                riskLevel = 'high';
                riskColor = 'red';
            } else if (riskPercentage >= 30) {
                riskLevel = 'medium';
                riskColor = 'yellow';
            }

            setAnalysis({
                riskLevel,
                riskColor,
                riskPercentage: Math.round(riskPercentage),
                flags: detectedFlags,
                isScam: riskPercentage >= 40
            });

            setIsAnalyzing(false);
        }, 1000);
    };

    const getRiskIcon = () => {
        if (!analysis) return null;

        if (analysis.riskLevel === 'high') {
            return <XCircle className="w-16 h-16 text-red-500" />;
        } else if (analysis.riskLevel === 'medium') {
            return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
        }
        return <CheckCircle className="w-16 h-16 text-green-500" />;
    };

    const getRiskBgColor = () => {
        if (!analysis) return 'bg-gray-100';
        if (analysis.riskColor === 'red') return 'bg-red-50';
        if (analysis.riskColor === 'yellow') return 'bg-yellow-50';
        return 'bg-green-50';
    };

    const getRiskTextColor = () => {
        if (!analysis) return 'text-gray-600';
        if (analysis.riskColor === 'red') return 'text-red-700';
        if (analysis.riskColor === 'yellow') return 'text-yellow-700';
        return 'text-green-700';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Scam Detector</h1>
                    <p className="text-gray-600">Paste a message, email, or text to analyze if it's a potential scam using AI-powered detection.</p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Paste Message or Email Content
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Paste the suspicious message, email, or text here..."
                        className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <button
                        onClick={analyzeMessage}
                        disabled={!message.trim() || isAnalyzing}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap className="w-5 h-5" />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <div className={`${getRiskBgColor()} rounded-lg shadow-md p-6 mb-6`}>
                        <div className="flex flex-col items-center mb-6">
                            {getRiskIcon()}
                            <h2 className={`text-3xl font-bold mt-4 ${getRiskTextColor()}`}>
                                {analysis.riskPercentage}% Risk Level
                            </h2>
                            <p className={`text-xl font-semibold ${getRiskTextColor()} uppercase mt-2`}>
                                {analysis.riskLevel} Risk
                            </p>
                            {analysis.isScam && (
                                <p className="text-red-700 font-bold mt-2 text-center">
                                    ⚠️ This message shows signs of being a scam
                                </p>
                            )}
                        </div>

                        {/* Risk Meter */}
                        <div className="mb-6">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full transition-all ${analysis.riskColor === 'red' ? 'bg-red-500' :
                                            analysis.riskColor === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${analysis.riskPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Detected Flags */}
                        {analysis.flags.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Detected Red Flags:</h3>
                                <div className="space-y-3">
                                    {analysis.flags.map((flag, idx) => (
                                        <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${flag.severity === 'high' ? 'text-red-500' :
                                                        flag.severity === 'medium' ? 'text-yellow-500' : 'text-gray-500'
                                                    }`} />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 capitalize">
                                                        {flag.category.replace(/([A-Z])/g, ' $1').trim()}
                                                    </h4>
                                                    <p className="text-gray-700 text-sm mt-1">{flag.description}</p>
                                                    {flag.matches.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {flag.matches.slice(0, 5).map((match, i) => (
                                                                <span key={i} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                                                                    {match}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tips Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Detection Tips</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>The AI detector looks for common scam keywords and patterns</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Always verify sender identity through official channels</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>Never click links or download attachments from suspicious sources</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>When in doubt, contact the organization directly</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}