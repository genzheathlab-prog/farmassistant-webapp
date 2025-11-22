"use client"

import { useState, useRef, useEffect } from "react"
import { Shield, Pill, FileText, MessageSquare, Upload, LogOut, CheckCircle2, AlertCircle, Send, Download, Sparkles, Database } from "lucide-react"

type Module = "afi" | "laudos" | null

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeModule, setActiveModule] = useState<Module>(null)
  
  // Login state
  const [crfNumber, setCrfNumber] = useState("")
  const [crfUF, setCrfUF] = useState("")
  const [userName, setUserName] = useState("")
  const [loginError, setLoginError] = useState("")
  
  // AFI Chat state
  const [messages, setMessages] = useState<Array<{role: "user" | "assistant", content: string}>>([]
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Laudos state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    if (!crfNumber || !crfUF || !userName) {
      setLoginError("Preencha todos os campos")
      return
    }
    
    // Simulação de validação (em produção, validar via API do CRF)
    if (crfNumber.length < 4) {
      setLoginError("O registro informado não está ativo. Apenas profissionais com CRF regularizado podem utilizar o Farmassistant.")
      return
    }
    
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setActiveModule(null)
    setCrfNumber("")
    setCrfUF("")
    setUserName("")
    setMessages([])
    setUploadedFile(null)
    setAnalysisResult(null)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    
    const userMessage = inputMessage
    setInputMessage("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ],
          conversationHistory: messages // Envia histórico para evitar repetições
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar resposta')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `**Erro ao processar sua solicitação:**\n\n${error.message}\n\n**Possíveis causas:**\n- Chave da API OpenAI não configurada (configure OPENAI_API_KEY no .env.local)\n- Problema de conexão com a API\n- Limite de requisições atingido\n\n**Solução:**\nVerifique as configurações de ambiente e tente novamente.` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
      setAnalysisResult(null)
    }
  }

  const handleAnalyzeLaudo = () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    
    // Simulação de análise (em produção, processar PDF com OCR/AI)
    setTimeout(() => {
      setAnalysisResult({
        materiaPrima: "Ácido Hialurônico",
        lote: "AH2024-001",
        fornecedor: "Pharma Ingredients Ltda",
        validade: "12/2025",
        reanálise: "06/2025",
        parametros: [
          {
            nome: "Aparência",
            especificacao: "Pó branco a levemente amarelado",
            resultadoFornecedor: "Pó branco",
            resultadoFarmacia: "Pó branco",
            status: "conforme"
          },
          {
            nome: "Identificação (FTIR)",
            especificacao: "Conforme padrão",
            resultadoFornecedor: "Conforme",
            resultadoFarmacia: "Conforme",
            status: "conforme"
          },
          {
            nome: "Teor (%)",
            especificacao: "95,0 - 105,0",
            resultadoFornecedor: "98,5",
            resultadoFarmacia: "98,2",
            status: "conforme"
          },
          {
            nome: "pH (solução 1%)",
            especificacao: "6,0 - 8,0",
            resultadoFornecedor: "7,2",
            resultadoFarmacia: "7,1",
            status: "conforme"
          },
          {
            nome: "Umidade (%)",
            especificacao: "≤ 10,0",
            resultadoFornecedor: "8,2",
            resultadoFarmacia: "8,5",
            status: "conforme"
          },
          {
            nome: "Metais Pesados (ppm)",
            especificacao: "≤ 20",
            resultadoFornecedor: "< 5",
            resultadoFarmacia: "Não realizado",
            status: "conforme"
          },
          {
            nome: "Contagem Microbiana (UFC/g)",
            especificacao: "≤ 1000",
            resultadoFornecedor: "< 100",
            resultadoFarmacia: "< 100",
            status: "conforme"
          }
        ],
        conclusao: "APROVADO",
        observacoes: "Todos os parâmetros analisados estão em conformidade com as especificações da Farmacopeia Brasileira 6ª edição. Matéria-prima aprovada para uso."
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleDownloadReport = () => {
    alert("Funcionalidade de download do relatório em PDF será implementada com biblioteca de geração de PDF (ex: jsPDF ou react-pdf)")
  }

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-cyan-100">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl">
                <Pill className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              Farmassistant
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Assistente Farmacêutica Inteligente
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Acesso restrito a profissionais farmacêuticos com registro ativo no CRF
                </p>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  placeholder="Digite seu nome"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do CRF
                </label>
                <input
                  type="text"
                  value={crfNumber}
                  onChange={(e) => setCrfNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: 12345"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UF do CRF
                </label>
                <select
                  value={crfUF}
                  onChange={(e) => setCrfUF(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">Selecione</option>
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MG">MG</option>
                  <option value="RS">RS</option>
                  <option value="PR">PR</option>
                  <option value="SC">SC</option>
                  <option value="BA">BA</option>
                  <option value="PE">PE</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="GO">GO</option>
                  <option value="ES">ES</option>
                  <option value="PA">PA</option>
                  <option value="AM">AM</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="RN">RN</option>
                  <option value="PB">PB</option>
                  <option value="AL">AL</option>
                  <option value="SE">SE</option>
                  <option value="PI">PI</option>
                  <option value="TO">TO</option>
                  <option value="RO">RO</option>
                  <option value="AC">AC</option>
                  <option value="RR">RR</option>
                  <option value="AP">AP</option>
                </select>
              </div>
              
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{loginError}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Acessar Sistema
              </button>
            </form>
            
            <p className="text-xs text-center text-gray-500 mt-6">
              Sistema desenvolvido em conformidade com RDC 67/2007 e Portaria 344/1998
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard Principal
  if (!activeModule) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-cyan-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
                  <Pill className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Farmassistant</h1>
                  <p className="text-sm text-gray-600">Bem-vindo(a), {userName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">CRF {crfNumber}/{crfUF}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" />
                    Registro Ativo
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Módulos */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Módulo AFI */}
            <button
              onClick={() => setActiveModule("afi")}
              className="bg-white rounded-2xl shadow-lg p-8 border border-cyan-100 hover:shadow-2xl hover:scale-105 transition-all text-left group"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform relative">
                <MessageSquare className="w-10 h-10 text-white" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <Sparkles className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Assistente Farmacêutica Inteligente
              </h2>
              <p className="text-gray-600 mb-4">
                IA avançada com acesso a compêndios técnicos online. Respostas personalizadas e não repetitivas baseadas em legislação e literatura científica atualizada.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Base de Conhecimento
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  GPT-4
                </span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  Respostas Únicas
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  RDC 67/2007
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Portaria 344/1998
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Farmacopeia
                </span>
              </div>
            </button>
            
            {/* Módulo Laudos */}
            <button
              onClick={() => setActiveModule("laudos")}
              className="bg-white rounded-2xl shadow-lg p-8 border border-cyan-100 hover:shadow-2xl hover:scale-105 transition-all text-left group"
            >
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Análise de Laudos
              </h2>
              <p className="text-gray-600 mb-4">
                Faça upload de laudos de fornecedores (PDF) e gere automaticamente o Certificado de Análise da Farmácia com comparação de parâmetros
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                  Controle de Qualidade
                </span>
                <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                  Automação
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Conformidade
                </span>
              </div>
            </button>
          </div>
          
          {/* Informações Legais */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Aviso Legal Importante</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  O Farmassistant é uma ferramenta de apoio técnico e <strong>NÃO substitui</strong> a responsabilidade técnica do farmacêutico. 
                  Todas as orientações devem ser validadas pelo farmacêutico responsável técnico da farmácia. 
                  O sistema não diagnostica, não prescreve e não define tratamentos médicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Módulo AFI (Assistente Farmacêutica Inteligente)
  if (activeModule === "afi") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModule(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg relative">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                    <Sparkles className="w-3 h-3 text-yellow-900" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Assistente Farmacêutica Inteligente</h2>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Powered by GPT-4 • Respostas únicas e contextualizadas
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 flex flex-col h-[calc(100vh-200px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-2xl mb-4 relative">
                    <MessageSquare className="w-12 h-12 text-white" />
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-pulse">
                      <Sparkles className="w-5 h-5 text-yellow-900" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">IA Farmacêutica Avançada</h3>
                  <p className="text-gray-600 mb-2 max-w-md">
                    Faça perguntas técnicas e receba respostas personalizadas baseadas em compêndios oficiais e literatura científica atualizada
                  </p>
                  <p className="text-sm text-cyan-600 mb-6 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Cada resposta é única e contextualizada à sua pergunta
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    <button
                      onClick={() => setInputMessage("Qual o prazo de estabilidade para uma formulação aquosa com vitamina C?")}
                      className="p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl text-left transition-colors border border-cyan-200"
                    >
                      <p className="text-sm font-medium text-gray-800">Estabilidade de formulações</p>
                    </button>
                    <button
                      onClick={() => setInputMessage("Como verificar incompatibilidades entre ácido hialurônico e outros ativos?")}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-colors border border-blue-200"
                    >
                      <p className="text-sm font-medium text-gray-800">Incompatibilidades</p>
                    </button>
                    <button
                      onClick={() => setInputMessage("Quais os requisitos da Portaria 344 para manipulação de sibutramina?")}
                      className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-left transition-colors border border-indigo-200"
                    >
                      <p className="text-sm font-medium text-gray-800">Portaria 344/1998</p>
                    </button>
                    <button
                      onClick={() => setInputMessage("Como realizar controle de qualidade de matérias-primas segundo a Farmacopeia?")}
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-colors border border-purple-200"
                    >
                      <p className="text-sm font-medium text-gray-800">Controle de Qualidade</p>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <div className="flex gap-2 items-center">
                          <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            
            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="Digite sua dúvida técnica..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Recomenda-se validação pelo farmacêutico responsável técnico da farmácia
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Módulo Laudos
  if (activeModule === "laudos") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-cyan-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModule(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Análise de Laudos</h2>
                  <p className="text-xs text-gray-600">Controle de Qualidade Automatizado</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Upload de Laudo</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Clique para fazer upload
                  </p>
                  <p className="text-xs text-gray-500">
                    Apenas arquivos PDF (máx. 10MB)
                  </p>
                </label>
              </div>
              
              {uploadedFile && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-600">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleAnalyzeLaudo}
                disabled={!uploadedFile || isAnalyzing}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analisando..." : "Analisar Laudo"}
              </button>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">O que será extraído:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Dados do fornecedor e matéria-prima</li>
                  <li>• Lote, validade e prazo de reanálise</li>
                  <li>• Especificações e resultados</li>
                  <li>• Métodos analíticos utilizados</li>
                  <li>• Controle microbiológico</li>
                </ul>
              </div>
            </div>
            
            {/* Results Area */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-cyan-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Resultado da Análise</h3>
                {analysisResult && (
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                )}
              </div>
              
              {!analysisResult ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    Faça upload de um laudo para iniciar a análise
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Informações Gerais */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Informações Gerais</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Matéria-Prima:</p>
                        <p className="font-medium text-gray-800">{analysisResult.materiaPrima}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lote:</p>
                        <p className="font-medium text-gray-800">{analysisResult.lote}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fornecedor:</p>
                        <p className="font-medium text-gray-800">{analysisResult.fornecedor}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Validade:</p>
                        <p className="font-medium text-gray-800">{analysisResult.validade}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Parâmetros */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Parâmetros Analisados</h4>
                    <div className="space-y-2">
                      {analysisResult.parametros.map((param: any, idx: number) => (
                        <div
                          key={idx}
                          className={`border rounded-lg p-3 ${
                            param.status === "conforme"
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-800 text-sm">{param.nome}</p>
                            {param.status === "conforme" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="text-xs space-y-1">
                            <p className="text-gray-600">
                              <span className="font-medium">Especificação:</span> {param.especificacao}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Fornecedor:</span> {param.resultadoFornecedor}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Farmácia:</span> {param.resultadoFarmacia}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Conclusão */}
                  <div
                    className={`rounded-lg p-4 ${
                      analysisResult.conclusao === "APROVADO"
                        ? "bg-green-100 border border-green-300"
                        : "bg-red-100 border border-red-300"
                    }`}
                  >
                    <h4 className="font-semibold text-gray-800 mb-2">Conclusão</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Status:</strong> {analysisResult.conclusao}
                    </p>
                    <p className="text-sm text-gray-700">{analysisResult.observacoes}</p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Importante:</strong> Este relatório deve ser validado e assinado pelo farmacêutico responsável técnico da farmácia.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
