import type { JSX } from "react"
/**
 * Simple markdown-like formatter for Gemini responses
 * Handles **bold**, *italic/emphasis*, bullet points, and line breaks
 */
export function formatInsight(text: string): JSX.Element {
    const lines = text.split('\n')

    return (
        <div className="space-y-3" >
            {
                lines.map((line, index) => {
                    // Skip empty lines
                    if (!line.trim()) return null

                    // Handle bullet points with multiple spaces (*   or -   )
                    if (line.trim().startsWith('*   ') || line.trim().startsWith('-   ')) {
                        const content = line.trim().substring(4).trim()
                        return (
                            <div key={index} className="flex gap-3 ml-4" >
                                <span className="text-green-600 mt-1 flex-shrink-0" >•</span>
                                < div className="flex-1" > {formatInlineMarkdown(content)} </div>
                            </div>
                        )
                    }

                    // Handle bullet points with single space (* or - )
                    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                        const content = line.trim().substring(2).trim()
                        return (
                            <div key={index} className="flex gap-3 ml-4" >
                                <span className="text-green-600 mt-1 flex-shrink-0" >•</span>
                                < div className="flex-1" > {formatInlineMarkdown(content)} </div>
                            </div>
                        )
                    }

                    // Handle section headers (lines ending with :)
                    if (line.trim().endsWith(':')) {
                        return (
                            <h3 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-2" >
                                {formatInlineMarkdown(line)}
                            </h3>
                        )
                    }

                    // Regular paragraph
                    return (
                        <p key={index} className="text-gray-700 leading-relaxed" >
                            {formatInlineMarkdown(line)}
                        </p>
                    )
                })}
        </div>
    )
}

/**
 * Format inline markdown: **bold** and *italic/emphasis*
 */
function formatInlineMarkdown(text: string): JSX.Element {
    const parts: JSX.Element[] = []
    let currentIndex = 0
    let partKey = 0

    // Regex to find **text** or *text*
    const regex = /(\*\*[^*]+?\*\*|\*[^*]+?\*)/g
    let match

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > currentIndex) {
            parts.push(
                <span key={partKey++}> {text.substring(currentIndex, match.index)} </span>
            )
        }

        const matched = match[0]

        // Handle **bold**
        if (matched.startsWith('**') && matched.endsWith('**')) {
            parts.push(
                <strong key={partKey++} className="font-semibold text-gray-900" >
                    {matched.slice(2, -2)}
                </strong>
            )
        }
        // Handle *text*
        else if (matched.startsWith('*') && matched.endsWith('*')) {
            parts.push(
                <strong key={partKey++} className="font-semibold text-gray-900" >
                    {matched.slice(1, -1)}
                </strong>
            )
        }

        currentIndex = match.index + matched.length
    }

    // Add remaining text
    if (currentIndex < text.length) {
        parts.push(<span key={partKey++}> {text.substring(currentIndex)} </span>)
    }

    return <>{parts} </>
}