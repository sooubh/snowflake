"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithLedgerBot } from '@/app/actions/chat';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Mermaid from './ui/Mermaid';
import ChartRenderer from './ui/ChartRenderer';
import { Bot, Send, X, Maximize2, Minimize2, Sparkles, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, if not I'll just use template literals carefully or standard string concat

import { useRouter, usePathname } from 'next/navigation';

export function LedgerBot() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // State for full screen
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
        { role: 'bot', text: "Hello! I'm LedgerBot 🤖. I can help you find reports, check stock status, or visualize data. Try asking 'Show me a flowchart of the process' or 'Show me a sales graph'." }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = { role: 'user' as const, text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const history = [...messages, userMsg];
            // Pass pathname to server for context awareness
            const response = await chatWithLedgerBot(history, pathname);
            const { reply, redirectPath, clientAction } = response as { reply: string, redirectPath?: string, clientAction?: any };
            setMessages(prev => [...prev, { role: 'bot', text: reply }]);
            
            if (redirectPath) {
                setTimeout(() => {
                    router.push(redirectPath);
                    setIsOpen(false); 
                }, 1500); 
            }

            if (clientAction) {
                // Dispatch custom event for page-specific handling
                const event = new CustomEvent(`ledgerbot-${clientAction.type.toLowerCase().replace(/_/g, '-')}`, { 
                    detail: clientAction.data 
                });
                window.dispatchEvent(event);
            }
        } catch (e) {
            console.error("LedgerBot UI Error:", e);
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            width: isExpanded ? "100vw" : "24rem", // Full width if expanded
                            height: isExpanded ? "100vh" : "500px", // Full height if expanded
                            borderRadius: isExpanded ? "0" : "2rem",
                            bottom: isExpanded ? 0 : "6rem", // 24 = 6rem
                            right: isExpanded ? 0 : "2rem", // 8 = 2rem
                        }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 15 }}
                        className={cn(
                            "fixed flex flex-col z-[100] overflow-hidden transition-all duration-300 ease-in-out font-sans",
                            "bg-white/95 dark:bg-black/95 backdrop-blur-3xl",
                            "border border-black/10 dark:border-white/10",
                            "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]",
                            isExpanded 
                                ? 'inset-0 md:inset-4 md:rounded-3xl' // Full screen on mobile, padded on desktop
                                : 'bottom-0 right-0 w-full h-[100dvh] md:bottom-24 md:right-8 md:w-[400px] md:h-[600px] md:rounded-[2.5rem]' // Full screen mobile, widget on desktop
                        )}
                    >
                        {/* Header */}
                        <div className="relative px-6 py-5 flex justify-between items-center shrink-0 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="size-11 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 text-primary">
                                    <Bot size={22} className="fill-primary/20" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
                                        LedgerBot
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                        </span>
                                        <p className="text-[11px] font-medium text-black/40 dark:text-white/40 uppercase tracking-widest">Online</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 relative z-10">
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)} 
                                    className="size-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all duration-200"
                                    title={isExpanded ? "Collapse" : "Expand"}
                                >
                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="size-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-red-500 transition-all duration-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-black/5 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-black/10 dark:hover:scrollbar-thumb-white/20">
                            {messages.map((msg, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`relative max-w-[85%] p-4 rounded-2xl text-[13.5px] leading-relaxed shadow-sm overflow-hidden ${
                                        msg.role === 'user' 
                                        ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-md font-medium ml-auto' 
                                        : 'bg-white dark:bg-neutral-800 text-black/80 dark:text-white/90 rounded-tl-md w-full border border-black/5 dark:border-white/5 mr-auto shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                                    }`}>
                                        {msg.role === 'bot' && (
                                            <div className="absolute -left-10 -top-2 size-8 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm text-primary">
                                                <Bot size={16} />
                                            </div>
                                        )}
                                        {msg.role === 'bot' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none 
                                                prose-p:my-1 prose-p:leading-relaxed prose-p:break-words
                                                prose-ul:my-1 prose-ul:pl-4 
                                                prose-li:my-0.5
                                                prose-strong:font-bold prose-strong:text-primary-dark dark:prose-strong:text-primary
                                                prose-table:w-full prose-table:my-2 prose-table:border-collapse prose-table:block prose-table:overflow-x-auto
                                                prose-th:bg-black/5 dark:prose-th:bg-white/5 prose-th:p-2 prose-th:text-left prose-th:text-xs prose-th:font-semibold prose-th:whitespace-nowrap
                                                prose-td:p-2 prose-td:text-xs prose-td:border-t prose-td:border-black/5 dark:prose-td:border-white/5 prose-td:min-w-[100px]
                                                prose-pre:max-w-full prose-pre:overflow-x-auto
                                            ">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code(props) {
                                                            const {children, className, node, ...rest} = props;
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const lang = match ? match[1] : '';

                                                            if (lang === 'mermaid') {
                                                                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                                            }

                                                            if (lang === 'chart') {
                                                                try {
                                                                    const chartConfig = JSON.parse(String(children));
                                                                    return <ChartRenderer config={chartConfig} />;
                                                                } catch (e) {
                                                                    return <code {...rest} className={className}>{children}</code>;
                                                                }
                                                            }

                                                            return match ? (
                                                                <code {...rest} className={className}>
                                                                    {children}
                                                                </code>
                                                            ) : (
                                                                <code {...rest} className={className}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start pl-12">
                                    <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-2xl rounded-tl-sm text-neutral-500 text-sm flex gap-2 items-center">
                                        <div className="flex gap-1">
                                            <span className="size-2 bg-primary rounded-full animate-bounce" />
                                            <span className="size-2 bg-primary rounded-full animate-bounce delay-75" />
                                            <span className="size-2 bg-primary rounded-full animate-bounce delay-150" />
                                        </div>
                                        <span className="text-xs font-medium opacity-50">Thinking...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white/50 dark:bg-black/50 backdrop-blur-md border-t border-black/5 dark:border-white/5">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2 items-center bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/10 rounded-[1.5rem] px-2 py-2 focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10 transition-all shadow-lg shadow-black/5"
                            >
                                <div className="pl-3 text-primary animate-pulse">
                                    <Sparkles size={18} className="fill-primary/20" />
                                </div>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] px-2 py-2 text-neutral-dark dark:text-white placeholder:text-neutral-400 font-medium"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim()} 
                                    className="size-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-md"
                                >
                                    <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </form>
                            <div className="text-[10px] text-center mt-2 text-neutral-400 font-medium">
                                AI can make mistakes. Please check important info.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 group z-50 pointer-events-auto"
            >
            <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300 opacity-60 animate-pulse" />
                <div className="relative size-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-105 border border-white/10">
                    {isOpen ? (
                        <X size={32} />
                    ) : (
                        <Bot size={32} />
                    )}
                </div>
            </motion.button>
        </>
    );
}
